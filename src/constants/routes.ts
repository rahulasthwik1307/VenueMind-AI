/**
 * Navigation routes for VenueMind AI.
 *
 * Stage 2: Only routes with implemented pages are active.
 * Future routes are defined but pages will be wired in later stages.
 */

export const ROUTES = {
  home: '/',
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
