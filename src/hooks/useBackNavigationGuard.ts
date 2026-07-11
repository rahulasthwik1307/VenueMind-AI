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
   * Navigates to the landing page using Next.js router.
   */
  confirmExit: () => void;
  /**
   * Call this when the user cancels. The guard has already re-pushed
   * the sentinel entry on the history stack, so no additional action
   * is required — the back-button state remains intact.
   */
  cancelExit: () => void;
}

/**
 * useBackNavigationGuard
 *
 * Intercepts browser back-button navigation that would take the user from any
 * (app) route back to the landing page ("/"), and triggers a confirmation
 * callback instead of allowing the navigation to complete silently.
 *
 * --- HOW IT WORKS ---
 *
 * 1. On mount, a "sentinel" history entry is pushed onto the stack via
 *    pushState({ __vmGuard: true }, ''). This means the user must press back
 *    once to pop the sentinel before the URL can change.
 *
 * 2. A popstate listener fires whenever the sentinel is popped. At that
 *    point, window.location.pathname still reflects the current app route
 *    (the sentinel entry has the same URL). We inspect the history state to
 *    detect whether this was our sentinel pop.
 *
 * 3. When the guard fires:
 *    a. The sentinel is immediately re-pushed so the back-button state remains
 *       intact (cancelling the dialog does not leave the history in a broken state).
 *    b. onGuardTriggered() is called so the parent can show a confirmation dialog.
 *
 * 4. Normal back/forward navigation between app pages is not intercepted:
 *    the (app) layout mounts AppShell on each page, so the sentinel is
 *    re-established on every page load within the app.
 *
 * --- SCOPE AND LIMITATIONS ---
 *
 * This guard covers the realistic case of accidental browser back-button
 * navigation from within the operations console to the landing page.
 *
 * It does NOT — and is not intended to — prevent navigation via:
 *   - Direct URL bar editing (deliberate user action, unguarded by design).
 *   - JavaScript router.push('/') called elsewhere in the app.
 *   - Browser forward button (not a "back to landing" scenario).
 *
 * The guard is scoped to AppShell, which is only rendered within the (app)
 * route group. It is never active on the landing page itself.
 */
export function useBackNavigationGuard({
  onGuardTriggered,
}: UseBackNavigationGuardOptions): UseBackNavigationGuardReturn {
  const router = useRouter();

  // Track whether we are currently showing the confirmation dialog to avoid
  // double-triggering if the user manages to fire popstate while dialog is open.
  const isDialogOpenRef = useRef(false);

  const pushSentinel = useCallback(() => {
    window.history.pushState({ __vmGuard: true }, '');
  }, []);

  useEffect(() => {
    // Push initial sentinel on mount so the first back-press pops it
    // (rather than immediately navigating away).
    pushSentinel();

    const handlePopState = (event: PopStateEvent) => {
      // Only intercept when our sentinel entry was what got popped.
      // A normal back between app pages also triggers popstate, but in that
      // case the popped state will not carry __vmGuard from our sentinel
      // (it was the state of the previous history entry, not our sentinel).
      //
      // However, because we always push the sentinel on top, the pop of the
      // sentinel will carry state === { __vmGuard: true }. Once popped, the
      // URL beneath is still the current app route (pushState used the same URL).
      //
      // After the sentinel is popped, window.location.pathname has NOT changed
      // to "/" yet — it still points to the current (app) page. This is the
      // correct interception moment.
      const poppedOurSentinel =
        event.state !== null &&
        typeof event.state === 'object' &&
        '__vmGuard' in event.state &&
        event.state.__vmGuard === true;

      if (!poppedOurSentinel) {
        // Not our sentinel — user is navigating between app pages normally.
        // Re-push a fresh sentinel so the guard stays active on the new page.
        pushSentinel();
        return;
      }

      // Our sentinel was popped. The next back-press would navigate to whatever
      // is below it in the stack (potentially "/"). Re-push the sentinel
      // immediately so cancelling the dialog leaves history intact.
      pushSentinel();

      if (isDialogOpenRef.current) {
        // Dialog already visible — do not double-trigger.
        return;
      }

      isDialogOpenRef.current = true;
      onGuardTriggered();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pushSentinel, onGuardTriggered]);

  const confirmExit = useCallback(() => {
    isDialogOpenRef.current = false;
    router.push(ROUTES.landing);
  }, [router]);

  const cancelExit = useCallback(() => {
    isDialogOpenRef.current = false;
    // Sentinel was already re-pushed in handlePopState before calling
    // onGuardTriggered(), so no additional history manipulation is needed here.
  }, []);

  return { confirmExit, cancelExit };
}
