'use client';

import { useCallback, useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseBackNavigationGuardOptions {
  /**
   * Called when the user has backed through all visited app pages and there is
   * no older history available within the application session.
   */
  onGuardTriggered: () => void;
}

interface UseBackNavigationGuardReturn {
  /** Closes the dialog. */
  closeDialog: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useBackNavigationGuard
 *
 * Implements a robust navigation guard using a clean history stack setup:
 * 1. On mount, we replace the first entry in the app session with a guard state ({ isVenueMindGuard: true }).
 * 2. We then push the real page entry on top of it ({ isVenueMindReal: true }).
 * 3. As the user navigates forward through other app pages (e.g. Incidents, AI Command, Map),
 *    Next.js pushes standard history entries on top.
 * 4. When clicking the browser back button, the browser pops through the history stack naturally
 *    (Map -> AI Command -> Incidents -> Dashboard).
 * 5. When the user reaches the very first visited page (Dashboard) and presses back, they land
 *    on the guard entry.
 * 6. We intercept the popstate event, verify the guard state, trigger the alert dialog,
 *    and immediately call window.history.forward() to keep the user on the page.
 */
let isGuardInitialized = false;

export function useBackNavigationGuard({
  onGuardTriggered,
}: UseBackNavigationGuardOptions): UseBackNavigationGuardReturn {
  const onGuardTriggeredRef = useRef(onGuardTriggered);
  useEffect(() => {
    onGuardTriggeredRef.current = onGuardTriggered;
  }, [onGuardTriggered]);

  // 1. Initialize the guard entry once at the very bottom of the app stack
  useEffect(() => {
    const initializeGuard = () => {
      if (isGuardInitialized) return;
      const state = window.history.state || {};
      if (!state.isVenueMindReal && !state.isVenueMindGuard) {
        try {
          // Replace current page entry with the guard entry
          window.history.replaceState({ ...state, isVenueMindGuard: true }, '');
          // Push the real active page entry on top of the guard
          window.history.pushState({ ...state, isVenueMindReal: true }, '', window.location.href);
          isGuardInitialized = true;
        } catch {
          // Fallback if history state operations fail in certain sandbox environments
        }
      }
    };

    initializeGuard();

    return () => {
      isGuardInitialized = false;
    };
  }, []);

  // 2. Listen to popstate and intercept when landing on the guard entry
  useEffect(() => {
    const handlePopState = () => {
      const state = window.history.state;
      if (state && state.isVenueMindGuard === true) {
        // User reached the bottom of the session history stack
        onGuardTriggeredRef.current();
        
        // Immediately go forward by 1 entry to return the browser to the real page entry
        window.history.forward();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const closeDialog = useCallback(() => {
    // No-op: the browser was already navigated forward back to the real page entry
    // when the guard was triggered.
  }, []);

  return { closeDialog };
}
