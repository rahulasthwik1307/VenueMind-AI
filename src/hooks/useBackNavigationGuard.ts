'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

interface UseBackNavigationGuardOptions {
  /**
   * Called when the browser back-button would navigate the user out of the
   * app to the landing page ("/"). Use this to show a confirmation dialog.
   */
  onGuardTriggered: () => void;
}

interface UseBackNavigationGuardReturn {
  /**
   * Call this when the user confirms they want to leave.
   * Navigates to the landing page using the Next.js router.
   */
  confirmExit: () => void;
  /**
   * Call this when the user cancels.
   * Re-arms the sentinel so the next back-press triggers the guard again.
   */
  cancelExit: () => void;
}

/**
 * useBackNavigationGuard
 *
 * Intercepts browser back-button navigation that would take the user from any
 * (app) route back to the landing page ("/"), showing a confirmation callback
 * instead of silently exiting.
 *
 * Normal in-app back navigation (e.g. /ai-command → /incidents → /dashboard)
 * is NOT blocked — it works naturally through the browser's built-in history.
 *
 * --- HOW IT WORKS (v4 — single sentinel at bottom) ---
 *
 * CORE CONCEPT: One "sentinel" history entry is pushed once, sitting between
 * "/" and the first app route. When the user presses back enough times to
 * exhaust all real app entries, the sentinel is the next thing popped.
 * We detect this via `popstate` and show a confirmation before the user
 * actually reaches "/".
 *
 * PREVIOUS BUG (v3): pushSentinel() was called on EVERY forward navigation
 * AND on every backward popstate event (including in-app navigation). This
 * flooded the history stack with sentinels, causing back-presses to consume
 * sentinels instead of navigating between real app routes. Users had to press
 * back many times before any actual navigation occurred.
 *
 * THIS FIX (v4):
 *   - Sentinel is pushed ONCE on mount.
 *   - popstate handler only acts when window.location.pathname === "/".
 *   - In-app popstate events (pathname is an app route) are completely ignored,
 *     letting the browser navigate naturally between app pages.
 *   - When the sentinel is consumed (user reaches "/"), the handler:
 *       a) Re-pushes the sentinel synchronously (restores guard for "Stay").
 *       b) Calls onGuardTriggered() to show the dialog.
 *   - cancelExit: nothing needed (sentinel re-pushed in step a).
 *   - confirmExit: sets a flag, calls router.push("/") for a clean exit.
 *
 * NAVIGATION SEQUENCE (correct behavior):
 *   App opens     →  stack: [/, sentinel, /dashboard]
 *   Go to /inc    →  stack: [/, sentinel, /dashboard, /incidents]
 *   Go to /ai     →  stack: [/, sentinel, /dashboard, /incidents, /ai-command]
 *   Press back    →  stack: [/, sentinel, /dashboard, /incidents] → renders /incidents ✓
 *   Press back    →  stack: [/, sentinel, /dashboard] → renders /dashboard ✓
 *   Press back    →  sentinel popped → pathname="/" → dialog shown ✓
 *   Cancel        →  sentinel re-pushed → stack: [/, sentinel, /dashboard] ✓
 *   Confirm exit  →  navigates to "/" cleanly ✓
 */
export function useBackNavigationGuard({
  onGuardTriggered,
}: UseBackNavigationGuardOptions): UseBackNavigationGuardReturn {
  const router = useRouter();
  const pathname = usePathname();

  // Prevent double-triggering if the user presses back rapidly while the
  // confirmation dialog is already visible.
  const isDialogOpenRef = useRef(false);

  // Set to true immediately before confirmExit() calls router.push('/').
  // Prevents any residual effects from fighting the confirmed navigation.
  const isConfirmedLeaveRef = useRef(false);

  // Stable reference to onGuardTriggered to avoid re-running the effect
  // when the callback identity changes due to parent re-renders.
  const onGuardTriggeredRef = useRef(onGuardTriggered);
  useEffect(() => {
    onGuardTriggeredRef.current = onGuardTriggered;
  }, [onGuardTriggered]);

  const pushSentinel = useCallback(() => {
    // Push a same-URL history entry. This adds one slot above the current
    // position so the next back-press pops the sentinel rather than
    // immediately navigating to the previous real URL.
    window.history.pushState(null, '');
  }, []);

  // --- Effect 1: Push sentinel ONCE on mount ---
  //
  // This places the sentinel between "/" and the first real app route.
  // We intentionally do NOT re-push this on every pathname change.
  // Normal Next.js Link navigation pushes real app routes on top of the
  // sentinel via its own history.pushState — the sentinel stays in place
  // below all app routes and is consumed only when the user exhausts the
  // entire in-app history.
  useEffect(() => {
    // Only push the sentinel once when the AppShell first mounts.
    // The pathname exclusion avoids a pointless sentinel push on "/",
    // but AppShell is only mounted inside the (app) group so this is
    // belt-and-suspenders only.
    if (pathname === ROUTES.landing) {
      return;
    }
    pushSentinel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — mount only

  // --- Effect 2: Intercept back-button presses via popstate ---
  //
  // Fires on every browser back/forward event.
  // KEY CHANGE from v3: we ONLY act when the destination is "/".
  // For all in-app navigation (any pathname that is not "/"), we do nothing
  // and let the browser handle it naturally.
  useEffect(() => {
    const handlePopState = () => {
      const currentPathname = window.location.pathname;

      // In-app navigation (e.g. /ai-command → /incidents): do nothing.
      // Let the browser's natural history traversal complete unobstructed.
      if (currentPathname !== ROUTES.landing) {
        return;
      }

      // The user has pressed back far enough to reach "/".
      // This means the sentinel was consumed (it sat between "/" and the app).
      // Re-push the sentinel BEFORE calling onGuardTriggered so that:
      //   a) If the user clicks "Stay", the next back-press re-triggers the guard.
      //   b) The history stack is restored synchronously.
      if (!isConfirmedLeaveRef.current) {
        pushSentinel();

        if (isDialogOpenRef.current) {
          // Dialog already open — do not double-trigger.
          return;
        }

        isDialogOpenRef.current = true;
        onGuardTriggeredRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pushSentinel]);

  const confirmExit = useCallback(() => {
    isDialogOpenRef.current = false;
    isConfirmedLeaveRef.current = true;
    // Navigate to "/" as a forward push so we get a clean, predictable
    // transition rather than relying on back-button mechanics.
    router.push(ROUTES.landing);
  }, [router]);

  const cancelExit = useCallback(() => {
    isDialogOpenRef.current = false;
    // The sentinel was already re-pushed synchronously in handlePopState
    // before onGuardTriggered() was called, so history is already restored.
    // No additional action needed.
  }, []);

  return { confirmExit, cancelExit };
}
