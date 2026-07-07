/**
 * Layout constants for VenueMind AI shell.
 * Used in both CSS tokens and component logic.
 */

export const HEADER_HEIGHT = 60 as const;
export const SIDEBAR_WIDTH = 240 as const;
export const SIDEBAR_COLLAPSED_WIDTH = 64 as const;
export const RIGHT_PANEL_WIDTH = 280 as const;
export const CONTENT_MAX_WIDTH = 1440 as const;
export const DEFAULT_PAGE_PADDING = 24 as const;
export const CARD_GAP = 16 as const;

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const ZOOM_DETAIL_THRESHOLD = 1.6 as const;
