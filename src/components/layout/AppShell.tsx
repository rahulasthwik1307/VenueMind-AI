'use client';

import { useState } from 'react';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { RightPanel } from './RightPanel';
import { AppFooter } from './AppFooter';
import { MobileSidebarOverlay } from './MobileSidebarOverlay';

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
 */
export function AppShell({ children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div
      className="flex flex-col min-h-dvh bg-(--background)"
      style={
        {
          '--header-height': '60px',
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

      {/* Bottom Footer */}
      <AppFooter />

      {/* Mobile Navigation Drawer */}
      <MobileSidebarOverlay
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </div>
  );
}
