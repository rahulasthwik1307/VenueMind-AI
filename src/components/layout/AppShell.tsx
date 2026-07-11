'use client';

import { useCallback, useState } from 'react';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { RightPanel } from './RightPanel';
import { MobileSidebarOverlay } from './MobileSidebarOverlay';
import { IncidentDrawer } from '@/components/incident/IncidentDrawer';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { DashboardSimulator } from '@/components/providers/DashboardSimulator';
import { useBackNavigationGuard } from '@/hooks/useBackNavigationGuard';

interface AppShellProps {
  children: React.ReactNode;
}

/**
 * AppShell — root layout frame for VenueMind AI.
 *
 * Layout structure:
 * ┌─────────────────────────────────────────────┐
 * │                  AppHeader                  │
 * ├──────────┬──────────────────────┬───────────┤
 * │          │                      │           │
 * │ Sidebar  │   Main Content Area  │ RightPanel│
 * │          │                      │           │
 * ├──────────┴──────────────────────┴───────────┤
 * │                  AppFooter                  │
 * └─────────────────────────────────────────────┘
 *
 * Back-navigation guard:
 * AppShell is the correct place for the back-navigation guard because it is
 * only rendered within the (app) route group — never on the landing page.
 * The guard intercepts browser back-button presses that would navigate to "/"
 * and shows a confirmation dialog instead of allowing silent exit.
 */
export function AppShell({ children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);

  const handleGuardTriggered = useCallback(() => {
    setIsExitDialogOpen(true);
  }, []);

  const { confirmExit, cancelExit } = useBackNavigationGuard({
    onGuardTriggered: handleGuardTriggered,
  });

  const handleConfirmExit = useCallback(() => {
    setIsExitDialogOpen(false);
    confirmExit();
  }, [confirmExit]);

  const handleCancelExit = useCallback(() => {
    setIsExitDialogOpen(false);
    cancelExit();
  }, [cancelExit]);

  return (
    <div
      className="flex flex-col min-h-screen h-dvh max-h-dvh bg-(--background) overflow-hidden"
      style={
        {
          '--header-height': '68px',
          '--sidebar-width': '240px',
          '--sidebar-collapsed-width': '64px',
          '--right-panel-width': '280px',
        } as React.CSSProperties
      }
    >
      {/* Top Header */}
      <AppHeader onMobileMenuOpen={() => setMobileNavOpen(true)} />

      {/* Body: Sidebar + Content + Right Panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (desktop) */}
        <AppSidebar />

        {/* Main Content */}
        <main
          id="main-content"
          className="flex-1 flex flex-col overflow-hidden min-w-0"
          role="main"
          aria-label="Main operations workspace"
          tabIndex={-1}
        >
          {children}
        </main>

        {/* Right Context Panel */}
        <RightPanel />
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileSidebarOverlay
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Incident Details Drawer */}
      <IncidentDrawer />

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Background Live Telemetry & Activity Simulator */}
      <DashboardSimulator />

      {/*
       * Back-navigation confirmation dialog.
       * Shown only when the browser back-button would navigate to "/" (the
       * landing page). Intentional exit via the sidebar Exit button bypasses
       * this dialog — it is only for accidental browser back-button presses.
       */}
      <ConfirmDialog
        isOpen={isExitDialogOpen}
        title="Leave the Operations Console?"
        description="You are about to return to the landing page. Any unsaved work may be lost."
        confirmLabel="Exit to Landing"
        cancelLabel="Stay"
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </div>
  );
}

