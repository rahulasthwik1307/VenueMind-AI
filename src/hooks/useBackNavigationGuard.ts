'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

interface UseBackNavigationGuardOptions {
  /**
   * Called when the browser back-button would navigate the user to the
   * landing page ("/"). Use this to show a confirmation dialog.
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
   * Call this when the user cancels. The guard has already re-pushed
   * the sentinel and restored history, so no additional action is needed.
   */
  cancelExit: () => void;
}

/**
 * useBackNavigationGuard
 *
 * Intercepts browser back-button navigation that would take the user from any
 * (app) route to the landing page ("/"), showing a confirmation callback instead.
 *
 * --- HOW IT WORKS (v2 — pathname-based detection) ---
 *
 * 1. On mount, a "sentinel" history entry is pushed with pushState so the user
 *    must press back once before any URL change can occur. This gives us the
 *    opportunity to intercept inside the popstate handler.
 *
 * 2. A popstate listener fires on every browser back/forward action. We check
 *    window.location.pathname AFTER the pop to determine where we ended up.
 *
 * 3a. If pathname === "/" → the user has navigated back to the landing page.
 *     We immediately re-push the sentinel (restoring the guard state so
 *     pressing back again after cancelling works correctly), then call
 *     onGuardTriggered() to show the confirmation dialog.
 *
 * 3b. If pathname !== "/" → normal in-app navigation. We re-push a fresh
 *     sentinel to keep the guard armed for future back-presses.
 *
 * --- WHY v1 FAILED ---
 *
 * v1 used event.state.__vmGuard to identify "our" sentinel pop. This failed
 * because Next.js App Router mutates/replaces history state with its own
 * internal objects on every client-side navigation. After the first guard
 * fire + re-push, the sentinel entry sits on top of Next.js-owned history
 * entries. A subsequent back-press pops the sentinel correctly, but the
 * entry below it has Next.js state — not { __vmGuard: true }. The v1 guard
 * misidentified this as "not our sentinel" and fell into the pass-through
 * branch, allowing the navigation to "/" to complete unguarded.
 *
 * v2 fixes this by using window.location.pathname as ground truth. It is
 * always reliable regardless of what Next.js puts in history.state.
 *
 * --- SCOPE AND LIMITATIONS ---
 *
 * This guard covers the realistic case of accidental browser back-button
 * navigation from within the operations console to the landing page.
 *
 * It does NOT — and is not intended to — prevent navigation via:
 *   - Direct URL bar editing (deliberate user action, unguarded by design).
 *   - JavaScript router.push('/') called programmatically.
 *   - Browser forward button (not a "back to landing" scenario).
 *
 * The guard is scoped to AppShell, which is only rendered within the (app)
 * route group. It is never active on the landing page itself.
 */
export function useBackNavigationGuard({
  onGuardTriggered,
}: UseBackNavigationGuardOptions): UseBackNavigationGuardReturn {
  const router = useRouter();

  // Prevent double-triggering if the user presses back rapidly while the
  // confirmation dialog is already visible.
  const isDialogOpenRef = useRef(false);

  // Stable reference to onGuardTriggered to avoid re-running the effect
  // when the callback identity changes (e.g. due to parent re-renders).
  const onGuardTriggeredRef = useRef(onGuardTriggered);
  useEffect(() => {
    onGuardTriggeredRef.current = onGuardTriggered;
  }, [onGuardTriggered]);

  const pushSentinel = useCallback(() => {
    // Push a same-URL history entry. This adds one entry above the current
    // position so the first back-press pops our sentinel rather than
    // immediately navigating to the previous URL.
    window.history.pushState(null, '');
  }, []);

  useEffect(() => {
    // Arm the guard immediately on mount.
    pushSentinel();

    const handlePopState = () => {
      // Use pathname as ground truth — immune to Next.js history state mutations.
      const isLandingPage = window.location.pathname === '/';

      if (isLandingPage) {
        // The user has navigated back to the landing page.
        // Re-push the sentinel BEFORE calling the callback so that:
        //   a) If the user cancels, the next back-press will re-trigger the guard.
        //   b) The history stack is restored to a consistent state synchronously.
        pushSentinel();

        if (isDialogOpenRef.current) {
          // Dialog already open — do not double-trigger.
          return;
        }

        isDialogOpenRef.current = true;
        onGuardTriggeredRef.current();
      } else {
        // Normal in-app navigation (e.g. /incidents → /dashboard via back).
        // Re-arm the sentinel so the guard stays active for the next back-press.
        pushSentinel();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pushSentinel]);

  const confirmExit = useCallback(() => {
    isDialogOpenRef.current = false;
    // Use router.push rather than history.go(-1) so we get a clean,
    // forward navigation to "/" rather than relying on back-button mechanics.
    router.push(ROUTES.landing);
  }, [router]);

  const cancelExit = useCallback(() => {
    isDialogOpenRef.current = false;
    // The sentinel was already re-pushed synchronously in handlePopState
    // before onGuardTriggered() was called, so history is already restored.
    // No additional history manipulation needed here.
  }, []);

  return { confirmExit, cancelExit };
}
