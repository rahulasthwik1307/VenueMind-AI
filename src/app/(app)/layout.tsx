import { AppShell } from '@/components/layout/AppShell';

/**
 * App route group layout.
 *
 * All operational routes inside (app)/ — dashboard, incidents, map, etc. —
 * inherit this layout, which wraps children in the full AppShell:
 * header, sidebar, right panel, toast container, incident drawer,
 * and the background simulation engine.
 *
 * The landing page at "/" lives in the (marketing) route group and does NOT
 * inherit this layout, so it receives none of the operational chrome.
 */
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
