/**
 * Digital Twin Zustand Store
 *
 * Owns ONLY UI-specific state for the Interactive Stadium Digital Twin.
 * Operational data (incidents, telemetry, analyses, activities) must
 * continue to come exclusively from useIncidentStore.
 *
 * Responsibilities:
 *  - Which zone the operator has selected
 *  - Which zone is hovered (tooltip)
 *  - Which overlays are visible
 *  - Which operational routes are animated
 *  - Whether camera follow mode is active
 */

import { create } from 'zustand';
import {
  DigitalTwinUIState,
  OverlayType,
  OperationalRoute,
} from '@/types/digitalTwin';

interface DigitalTwinActions {
  /** Select (or deselect) a stadium zone */
  selectZone: (zoneId: string | null) => void;
  /** Set the zone currently under the pointer */
  setHoveredZone: (zoneId: string | null) => void;
  /** Toggle a specific overlay on or off */
  toggleOverlay: (overlay: OverlayType) => void;
  /** Add an animated operational route */
  addRoute: (route: OperationalRoute) => void;
  /** Remove a single route by ID */
  removeRoute: (routeId: string) => void;
  /** Clear all active routes */
  clearRoutes: () => void;
  /** Enable or disable camera auto-follow */
  setCameraFollow: (active: boolean) => void;
  /** Reset all UI state to defaults */
  resetUI: () => void;
}

type DigitalTwinStore = DigitalTwinUIState & DigitalTwinActions;

const DEFAULT_OVERLAYS: Record<OverlayType, boolean> = {
  crowdDensity: true,
  incidents: true,
  routes: true,
  cameras: false,
  weather: false,
  parking: false,
  transport: false,
};

const DEFAULT_STATE: DigitalTwinUIState = {
  selectedZoneId: null,
  hoveredZoneId: null,
  activeOverlays: DEFAULT_OVERLAYS,
  activeRoutes: [],
  isCameraFollowActive: true,
};

export const useDigitalTwinStore = create<DigitalTwinStore>((set) => ({
  ...DEFAULT_STATE,

  selectZone: (zoneId) => set({ selectedZoneId: zoneId }),

  setHoveredZone: (zoneId) => set({ hoveredZoneId: zoneId }),

  toggleOverlay: (overlay) =>
    set((state) => ({
      activeOverlays: {
        ...state.activeOverlays,
        [overlay]: !state.activeOverlays[overlay],
      },
    })),

  addRoute: (route) =>
    set((state) => ({
      activeRoutes: [...state.activeRoutes, route],
    })),

  removeRoute: (routeId) =>
    set((state) => ({
      activeRoutes: state.activeRoutes.filter((r) => r.id !== routeId),
    })),

  clearRoutes: () => set({ activeRoutes: [] }),

  setCameraFollow: (active) => set({ isCameraFollowActive: active }),

  resetUI: () => set(DEFAULT_STATE),
}));
