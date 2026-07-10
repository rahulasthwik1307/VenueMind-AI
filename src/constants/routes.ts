/**
 * Navigation routes for VenueMind AI.
 *
 * Stage 6: Route architecture updated.
 * - `landing` serves the marketing landing page at "/".
 * - `dashboard` is the primary operational entry point at "/dashboard".
 * - All operational routes live inside the `(app)` route group, which
 *   wraps them in the AppShell (header, sidebar, right panel, simulator).
 * - The landing page at "/" lives in the `(marketing)` route group and
 *   receives no AppShell chrome.
 */

export const ROUTES = {
  /** Landing / marketing page. The root route — no app chrome. */
  landing: '/',
  /** Operations dashboard — primary app entry point. Inherits AppShell. */
  dashboard: '/dashboard',
  incidents: '/incidents',
  aiCommand: '/ai-command',
  map: '/map',
  crowd: '/crowd',
  transport: '/transport',
  emergency: '/emergency',
  accessibility: '/accessibility',
  timeline: '/timeline',
  settings: '/settings',
} as const;

