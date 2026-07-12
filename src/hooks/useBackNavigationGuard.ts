'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseBackNavigationGuardOptions {
  /**
   * Called whenever the browser back-button is pressed while the user is
   * inside the (app) route group. Use this to show a confirmation dialog.
   *
   * Every back-press fires this callback — the guard entry is re-pushed
   * synchronously before the callback is called, so the URL and page content
   * never change regardless of whether the user confirms or cancels.
   */
  onGuardTriggered: () => void;
}

interface UseBackNavigationGuardReturn {
  /**
   * Call when the user confirms they want to leave the app.
   * Navigates cleanly to the landing page via Next.js router.push.
   */
  confirmExit: () => void;
  /**
   * Call when the user cancels and wants to stay.
   * The guard is already re-armed — no additional action is required.
   */
  cancelExit: () => void;
}

// ---------------------------------------------------------------------------
// Guard state token — used to identify entries we own in the history stack.
// ---------------------------------------------------------------------------

/**
 * The state object we push for every guard entry.
 * We use this to identify guard entries vs. real navigation entries.
 * (Not strictly required for correctness in this implementation, but useful
 * for debugging and future extensions.)
 */
const GUARD_STATE = { isVenueMindGuard: true } as const;

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useBackNavigationGuard — v5 (complete rebuild)
 *
 * Intercepts ALL browser back-button presses while the user is inside the
 * (app) route group, showing a confirmation dialog instead of allowing
 * silent navigation.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * WHY ALL PREVIOUS VERSIONS (v1–v4) FAILED
 * ─────────────────────────────────────────────────────────────────────────
 *
 * v1–v4 all shared the same fundamental design:
 *   - Push ONE "sentinel" entry on mount (or mount+navigation in some versions).
 *   - In the `popstate` handler, check `window.location.pathname === "/"`.
 *   - Only act if the user has reached "/".
 *
 * This is broken because:
 *
 * 1. WRONG MENTAL MODEL — Next.js App Router manages history itself.
 *    It may call `history.pushState` or `history.replaceState` for internal
 *    purposes (scroll restoration, prefetching, hydration). The sentinel
 *    placed once on mount is NOT reliably at a fixed position relative to
 *    real app route entries. After a few navigations the stack looks nothing
 *    like the assumed [/, sentinel, /dashboard, /incidents, /ai-cmd] model.
 *
 * 2. SILENT FAILURES — Because the guard only acts when `pathname === "/"`,
 *    every in-app back-press (e.g. /ai-cmd → /incidents) silently succeeds
 *    without showing any dialog. These are the "first back press does nothing"
 *    events reported in testing. The user has to exhaust ALL real app history
 *    entries before the sentinel is reached.
 *
 * 3. EXTERNAL BYPASS — After consuming all real app history entries AND the
 *    sentinel, the browser falls into pre-app history (the user's previous
 *    tabs: Google, other sites). There is no guard left to intercept this.
 *
 * 4. "STAY" DEGRADATION — The sentinel is re-pushed in the popstate handler,
 *    but its position in the stack relative to real entries is unpredictable
 *    after multiple navigations and re-pushes. The `isDialogOpenRef` race
 *    condition further prevents the guard from re-triggering correctly.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * THE CORRECT PATTERN — PERSISTENT GUARD ENTRY (v5)
 * ─────────────────────────────────────────────────────────────────────────
 *
 * KEY INSIGHT: Instead of a single sentinel at the bottom, maintain a guard
 * entry that is ALWAYS the topmost entry in the history stack — pushed fresh
 * on every page load and re-pushed immediately on every popstate event.
 *
 * This guarantees:
 *   - Every single back-press pops the guard entry first → popstate fires.
 *   - We neutralize the navigation synchronously (re-push) before any UI
 *     change occurs.
 *   - The dialog is shown. The user's page never changes.
 *   - The guard re-arms itself automatically on every back-press and on every
 *     forward navigation (pathname change).
 *   - There is no scenario where a back-press can silently succeed.
 *
 * HISTORY STACK STRUCTURE (maintained invariant):
 *
 *   [..., /prev-page, /prev-page-guard, /curr-page, /curr-page-guard]
 *                                                     ^^^^ always on top
 *
 * NAVIGATION SEQUENCE:
 *
 *   Mount on /dashboard    → push guard → [..., /dashboard, /dashboard-guard]
 *   Navigate to /incidents → Next.js pushes /incidents → Effect 1 fires →
 *                            push guard → [..., /dash, /dash-g, /inc, /inc-g]
 *   Press back             → pops /inc-g → popstate → re-push /inc-g → dialog
 *   Click "Stay"           → guard already armed → back-press → dialog again ✓
 *   Click "Leave"          → isConfirmedLeave=true → router.push('/') ✓
 *
 * NOTE ON IN-APP BACK NAVIGATION:
 *   The browser back button is fully intercepted for ALL back-presses while
 *   within the (app) route group. This is intentional: the sidebar is the
 *   correct navigation mechanism in an enterprise operations console; the
 *   back button is reserved for exiting (with confirmation). Forward
 *   navigation via sidebar Links is unaffected.
 */
export function useBackNavigationGuard({
  onGuardTriggered,
}: UseBackNavigationGuardOptions): UseBackNavigationGuardReturn {
  const router = useRouter();
  const pathname = usePathname();

  // ── Refs ──────────────────────────────────────────────────────────────────

  /**
   * Prevents stacking multiple dialogs if back is pressed rapidly while the
   * dialog is already visible.
   */
  const isDialogOpenRef = useRef(false);

  /**
   * Set to true immediately before `router.push(ROUTES.landing)` in
   * `confirmExit`. This tells both Effect 1 (pathname change → don't re-push
   * guard for the landing page) and the popstate handler (don't intercept
   * the navigation we just initiated) to stand down.
   *
   * The AppShell unmounts when the landing page renders (it lives in the
   * (marketing) route group, not (app)), so this ref resets automatically
   * with the component.
   */
  const isConfirmedLeaveRef = useRef(false);

  /**
   * Always-current reference to `onGuardTriggered`. Avoids stale closure
   * captures in the popstate handler (which is registered only once on mount).
   */
  const onGuardTriggeredRef = useRef(onGuardTriggered);
  useEffect(() => {
    onGuardTriggeredRef.current = onGuardTriggered;
  }, [onGuardTriggered]);

  // ── Effect 1: Push guard entry on every pathname change ───────────────────
  //
  // Fires on initial mount AND on every Next.js route transition within the
  // (app) group. After each transition, pushes a guard entry on top of the
  // new real entry so there is always a guard entry as the topmost slot.
  //
  // This is the re-arming mechanism for forward navigation.
  useEffect(() => {
    // Do not push a guard entry if we are navigating away (Leave confirmed).
    // The AppShell is about to unmount anyway.
    if (isConfirmedLeaveRef.current) return;

    // Push a guard entry that mirrors the current URL. Using the full href
    // (not just pathname) preserves any hash/search params.
    window.history.pushState(GUARD_STATE, '', window.location.href);
  }, [pathname]);

  // ── Effect 2: Permanent popstate listener ────────────────────────────────
  //
  // Registered ONCE on mount. Never removed until the component unmounts
  // (AppShell leaves the DOM when the user exits the app group entirely).
  //
  // Empty dependency array is intentional: the handler reads all runtime
  // values via refs (always current), so no stale closure risk. Using an
  // empty array also avoids a brief unprotected window that would occur if
  // the listener were removed-and-re-added on every pathname change.
  useEffect(() => {
    const handlePopState = () => {
      // A confirmed leave is in progress (router.push('/') was called).
      // Do not interfere — let Next.js complete the transition.
      if (isConfirmedLeaveRef.current) return;

      // ── CRITICAL STEP ────────────────────────────────────────────────────
      // Immediately re-push a guard entry. This synchronously neutralizes the
      // back-navigation that just occurred:
      //   - The browser popped the guard entry (current URL → previous URL).
      //   - Since guard entry URL === real page URL, `window.location.href`
      //     after the pop is the same URL the guard was protecting.
      //   - Re-pushing restores the guard as the topmost entry.
      //   - The user's visible page does NOT change.
      // This must happen before the dialog callback so that "Stay" requires
      // zero additional re-arming — the guard is already set for the next press.
      window.history.pushState(GUARD_STATE, '', window.location.href);

      // Do not show a second dialog if one is already open.
      if (isDialogOpenRef.current) return;

      isDialogOpenRef.current = true;
      onGuardTriggeredRef.current();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // intentionally empty — see comment above

  // ── Confirm exit ─────────────────────────────────────────────────────────

  const confirmExit = useCallback(() => {
    isDialogOpenRef.current = false;
    // Signal both Effect 1 and the popstate handler to stand down before
    // initiating the navigation, so neither interferes with the clean exit.
    isConfirmedLeaveRef.current = true;
    // Navigate to the landing page using Next.js router for a clean,
    // client-side transition — never a hard reload, never to an external URL.
    router.push(ROUTES.landing);
  }, [router]);

  // ── Cancel exit ──────────────────────────────────────────────────────────

  const cancelExit = useCallback(() => {
    // Reset dialog flag — guard is already fully re-armed (the pushState call
    // in handlePopState happened synchronously before onGuardTriggered was
    // called, so the next back-press will fire popstate immediately).
    isDialogOpenRef.current = false;
  }, []);

  return { confirmExit, cancelExit };
}
