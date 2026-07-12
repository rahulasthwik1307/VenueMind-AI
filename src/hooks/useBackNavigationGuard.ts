'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseBackNavigationGuardOptions {
  /**
   * Called only when the user has backed through all visited app pages and
   * the next back-press would leave the (app) route group entirely.
   */
  onGuardTriggered: () => void;
}

interface UseBackNavigationGuardReturn {
  /** Navigates cleanly to "/" when the user confirms leaving. */
  confirmExit: () => void;
  /** Closes the dialog and re-arms the guard when the user cancels. */
  cancelExit: () => void;
}

// Identifies history entries owned by this guard.
const GUARD_STATE = { isVenueMindGuard: true } as const;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useBackNavigationGuard — v7
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DESIRED BEHAVIOUR
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   Dashboard → Map → AI Command
 *   ← back                     → Map          (no dialog) ✓
 *   ← back                     → Dashboard    (no dialog) ✓
 *   ← back (nothing left)      → DIALOG       ✓
 *   "Stay"                     → Dashboard    (guard re-armed) ✓
 *   ← back again               → DIALOG again ✓  (every time, forever)
 *   "Leave"                    → "/"          (clean, no reload) ✓
 *   → forward                  → Map          (forward button works) ✓
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WHY v6 WAS STILL BROKEN — THE RACE CONDITION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * v6 tracked a custom navHistory stack correctly BUT still did not push a
 * guard entry on every navigation. When the user pressed back from /dashboard,
 * the URL changed to "/" (pre-app) BEFORE our popstate handler fired.
 *
 * Next.js registers its own popstate listener during module initialisation,
 * which is EARLIER than our useEffect. So on every back press:
 *
 *   1. Back pressed → URL changes to pre-app URL (e.g., "/")
 *   2. Next.js popstate handler fires first → starts navigating to "/"
 *   3. Our handler fires → calls history.pushState('/dashboard') to cancel
 *   4. Race: does step 3 cancel step 2 in time? Sometimes yes, sometimes no.
 *
 * Result: inconsistent – sometimes dialog showed, sometimes landing page appeared.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THE FIX — GUARD ENTRY ON EVERY NAVIGATION (SAME URL)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * KEY INSIGHT: If the guard entry has the SAME URL as the current page, then
 * when back pops the guard, the URL does NOT change. Next.js sees no URL
 * change and does NOTHING. Our popstate handler fires safely with full control.
 *
 * We push a guard entry (same URL, guard state) after every forward navigation
 * (Effect A). The history invariant we maintain:
 *
 *   [..., /prev-page-guard, /curr-page-real, /curr-page-guard]   ← always on top
 *                                               ^^^^ current
 *
 * ON BACK PRESS (guard popped):
 *   - URL unchanged (guard URL === real page URL).
 *   - popstate fires; Next.js does nothing (URL same).
 *   - We immediately re-push the guard (history.pushState).
 *   - Check navHistory:
 *       A. length > 1 → in-app back: use history.go(-2) to jump to the
 *          previous page's guard entry. This changes the URL to the previous
 *          page, which Next.js correctly renders. No dialog shown.
 *       B. length === 1 → exit attempt: show dialog. Guard stays on top.
 *          Next back-press triggers B again. Works forever.
 *
 * ON FORWARD BUTTON:
 *   history.go(-2) preserves the forward entries (it doesn't truncate).
 *   The forward button works naturally in common sequences.
 *
 * history.go(-2) path:
 *   Before: [..., /prev-g, /curr-real, /curr-g-repush]   current=curr-g-repush
 *   go(-2): [..., /prev-g, /curr-real, /curr-g-repush]   current=prev-g
 *   URL changes to prev-page → Next.js renders prev-page ✓
 *   Forward entries (curr-real, curr-g-repush) are preserved ✓
 */
export function useBackNavigationGuard({
  onGuardTriggered,
}: UseBackNavigationGuardOptions): UseBackNavigationGuardReturn {
  const router = useRouter();
  const pathname = usePathname();

  // ── Navigation state ──────────────────────────────────────────────────────

  /**
   * Ordered list of app pathnames the user has visited since mount.
   * Seeded with the initial pathname so the first render is already tracked.
   * Grows on every forward Link navigation; shrinks on in-app back navigation.
   */
  const navHistoryRef = useRef<string[]>([pathname]);

  /**
   * LIFO stack of pathnames the user has backed through.
   * Used to detect forward-button presses and restore correct state.
   * Cleared when the user makes a new forward Link navigation.
   */
  const forwardStackRef = useRef<string[]>([]);

  // ── Suppression flags ─────────────────────────────────────────────────────

  /**
   * Set before history.go(-2) in the in-app back handler.
   * Prevents Effect A from pushing a NEW guard for the destination page —
   * the previous page's own guard is already on top after history.go(-2),
   * and pushing another would corrupt the stack.
   */
  const suppressGuardPushRef = useRef(false);

  /**
   * Set when in-app back nav or forward-button nav manages navHistory directly.
   * Prevents Effect B from double-updating navHistory for the same navigation.
   */
  const suppressNavHistoryRef = useRef(false);

  /**
   * Set just before calling history.go(-2) for in-app back.
   * The go(-2) call fires a popstate event asynchronously. This flag tells
   * our handler to ignore that event (it's our own internal navigation,
   * not a user back/forward press).
   */
  const isGoingBackInAppRef = useRef(false);

  // ── Dialog / exit state ───────────────────────────────────────────────────

  /** Prevents stacking duplicate dialogs on rapid back-presses. */
  const isDialogOpenRef = useRef(false);

  /**
   * Set before router.push('/') to tell both effects and the popstate handler
   * to stand down. The AppShell unmounts automatically when landing renders
   * (it's in the (marketing) group), so this ref is self-cleaning.
   */
  const isConfirmedLeaveRef = useRef(false);

  // ── Misc ──────────────────────────────────────────────────────────────────

  /** Skips the initial Effect B run (navHistory already seeded via useRef). */
  const isMountedRef = useRef(false);

  /** Stable ref to the callback to avoid stale closures in the popstate handler. */
  const onGuardTriggeredRef = useRef(onGuardTriggered);
  useEffect(() => {
    onGuardTriggeredRef.current = onGuardTriggered;
  }, [onGuardTriggered]);

  // ── Effect A: Push guard after every forward navigation ───────────────────
  //
  // Maintains the invariant: guard entry is always the topmost history entry.
  // Uses the SAME URL as the current page so back presses don't change the URL
  // (Next.js sees no URL change → does nothing → we retain full control).
  useEffect(() => {
    if (isConfirmedLeaveRef.current) return;

    if (suppressGuardPushRef.current) {
      // In-app back navigation: the previous page's guard is already the top
      // entry after history.go(-2). Don't push another one on top.
      suppressGuardPushRef.current = false;
      return;
    }

    // Prevent double-push in React Strict Mode. If the guard is already on top, do nothing.
    if (window.history.state?.isVenueMindGuard) {
      return;
    }

    // Push guard with the current page's full URL (preserving hash/search).
    // CRITICAL: We must preserve Next.js's internal history state (e.g., __NA tree)
    // otherwise Next.js will panic on popstate and force a hard reload or external exit.
    const currentState = window.history.state || {};
    window.history.pushState({ ...currentState, ...GUARD_STATE }, '', window.location.href);
  }, [pathname]);

  // ── Effect B: Track forward navigations in navHistory ────────────────────
  //
  // Updates navHistoryRef only for user-initiated forward navigations (Link
  // clicks, programmatic router.push, etc.). Back/forward button navigations
  // are already managed by the popstate handler.
  useEffect(() => {
    // Skip the very first run — navHistory is already seeded via useRef.
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    if (isConfirmedLeaveRef.current) return;

    if (suppressNavHistoryRef.current) {
      // navHistory was already updated manually (by the popstate handler for
      // in-app back or forward-button navigation). Skip to avoid duplication.
      suppressNavHistoryRef.current = false;
      return;
    }

    // Forward navigation via a sidebar Link or programmatic push.
    navHistoryRef.current.push(pathname);
    // Discard forward history (new branch — mirrors browser behaviour).
    forwardStackRef.current = [];
  }, [pathname]);

  // ── Popstate listener ─────────────────────────────────────────────────────
  //
  // Registered once on mount. All mutable values are read via refs so there
  // is no stale-closure risk even with an empty dependency array. Keeping the
  // listener permanent avoids the brief unprotected gap that would exist if it
  // were torn down and re-added on every pathname change.
  useEffect(() => {
    const handlePopState = () => {
      if (isConfirmedLeaveRef.current) return;

      // ── Suppress our own history.go(-2) popstate ─────────────────────────
      // When we call history.go(-2) for in-app back navigation, it fires a
      // popstate event. We flag this case so we don't misinterpret our own
      // internal navigation as a user back-press.
      if (isGoingBackInAppRef.current) {
        isGoingBackInAppRef.current = false;
        return; // let Next.js render the destination page; effects handle the rest
      }

      const newPathname = window.location.pathname;

      // ── Forward button detection ──────────────────────────────────────────
      // After in-app back navigation, history.go(-2) preserves forward entries
      // in the browser. When the user presses the forward button, popstate fires
      // with the URL of the next forward entry. We detect this by checking if
      // the new URL matches the top of our own forwardStack.
      const topForward = forwardStackRef.current[forwardStackRef.current.length - 1];
      if (topForward !== undefined && topForward === newPathname) {
        // Forward button pressed — restore the page.
        forwardStackRef.current.pop();
        navHistoryRef.current.push(newPathname);
        // Suppress Effect B from double-pushing (we just updated navHistory here).
        suppressNavHistoryRef.current = true;
        // Do NOT suppress Effect A — it should push a guard for the restored page.
        return; // let Next.js render the forward page naturally
      }

      // ── Back button: guard entry was just popped ──────────────────────────
      //
      // The guard entry (same URL as current page) was popped. Since the URL
      // did NOT change (guard URL === real page URL), Next.js's popstate handler
      // already fired but saw no URL difference → did nothing. We now have full
      // control.
      //
      // CRITICAL: Re-push the guard immediately. This:
      //   a) Keeps the guard on top for the next back-press.
      //   b) Truncates any stale forward guard entries (harmless).
      //   c) Is synchronous — no rendering has occurred yet.
      const currentState = window.history.state || {};
      window.history.pushState({ ...currentState, ...GUARD_STATE }, '', window.location.href);

      if (navHistoryRef.current.length > 1) {
        // ── Case A: In-app back navigation ───────────────────────────────────
        // There is a previous app page. Navigate to it without showing a dialog.
        //
        // We use history.go(-2) to jump from the re-pushed guard (current top)
        // back 2 entries, landing on the previous page's guard entry. This
        // causes the URL to change to the previous page's URL, which Next.js
        // renders correctly. The forward entries (curr-real, curr-guard-repush)
        // are preserved by history.go (unlike pushState which would truncate them).
        const currentPage = navHistoryRef.current.pop()!;
        forwardStackRef.current.push(currentPage);

        // Don't push another guard in Effect A for the destination page —
        // its own guard is already the current top after history.go(-2).
        suppressGuardPushRef.current = true;
        // Don't update navHistory in Effect B — we already popped it above.
        suppressNavHistoryRef.current = true;
        // Mark the incoming popstate from history.go(-2) as ours.
        isGoingBackInAppRef.current = true;

        window.history.go(-2);
      } else {
        // ── Case B: Exit attempt ──────────────────────────────────────────────
        // navHistory has only 1 entry — the user is at the earliest app page
        // they've visited. Backing further would leave the app.
        // The guard is already re-pushed above, so the URL stays at the current
        // app page. Show the dialog. The guard will fire again on every
        // subsequent back-press until the user explicitly confirms leaving.
        if (!isDialogOpenRef.current) {
          isDialogOpenRef.current = true;
          onGuardTriggeredRef.current();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []); // empty deps — intentional; all state accessed via refs

  // ── confirmExit ───────────────────────────────────────────────────────────

  const confirmExit = useCallback(() => {
    isDialogOpenRef.current = false;
    // Signal both effects and the popstate handler to stand down.
    isConfirmedLeaveRef.current = true;
    // Navigate to the landing page cleanly via the Next.js router.
    // No hard reload. No external navigation. AppShell will unmount
    // automatically (the landing page is in the (marketing) route group).
    router.push(ROUTES.landing);
  }, [router]);

  // ── cancelExit ────────────────────────────────────────────────────────────

  const cancelExit = useCallback(() => {
    isDialogOpenRef.current = false;
    // The guard is already re-pushed (the pushState call in handlePopState ran
    // synchronously before onGuardTriggered was called). navHistory is unchanged
    // (still length 1). The next back-press will trigger the exit branch again. ✓
  }, []);

  return { confirmExit, cancelExit };
}
