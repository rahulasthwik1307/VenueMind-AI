/**
 * Digital Twin — Type Definitions
 *
 * Defines the shape of all UI-only state, zone configurations,
 * overlay types, operational routes, and camera state for the
 * Interactive Stadium Digital Twin.
 */

// ─── Overlay ─────────────────────────────────────────────────────────────────

export type OverlayType =
  | 'crowdDensity'
  | 'incidents'
  | 'routes'
  | 'cameras'
  | 'weather'
  | 'parking'
  | 'transport';

// ─── Routes ──────────────────────────────────────────────────────────────────

export type RouteType =
  | 'medical'
  | 'security'
  | 'volunteer'
  | 'vip'
  | 'transport'
  | 'evacuation';

export interface OperationalRoute {
  id: string;
  type: RouteType;
  incidentId?: string;
  recommendationId?: string;
  pathData: string; // SVG path d attribute
  label: string;
  isActive: boolean;
  startedAt: string; // ISO timestamp
}

// ─── Zones ───────────────────────────────────────────────────────────────────

export type ZoneType =
  | 'seating'
  | 'premium'
  | 'operations'
  | 'gate'
  | 'external'
  | 'services'
  | 'infrastructure';

export type ZoneStatus = 'normal' | 'busy' | 'high' | 'critical' | 'closed' | 'evacuating';

export type LinkedIncidentCategory =
  | 'crowd'
  | 'medical'
  | 'security'
  | 'infrastructure'
  | 'transport'
  | 'weather'
  | 'volunteer'
  | 'accessibility';

export interface ZoneFocusPoint {
  /** SVG x coordinate to pan camera to */
  x: number;
  /** SVG y coordinate to pan camera to */
  y: number;
  /** Target zoom level when this zone is selected */
  zoom: number;
}

export interface StadiumZoneConfig {
  id: string;
  name: string;
  shortName: string;
  type: ZoneType;
  /** Approximate capacity (spectators or personnel) */
  capacity: number;
  /** Pre-computed SVG path data for the zone shape */
  svgPath: string;
  /** Center point for label and tooltip anchor */
  labelPosition: { x: number; y: number };
  /** Camera focus target when this zone is selected */
  focusPoint: ZoneFocusPoint;
  /** Incident categories that logically belong in this zone */
  linkedIncidentCategories: LinkedIncidentCategory[];
  /** Base fill color for the zone (operational status overrides this) */
  defaultColor: string;
  /** Operational description shown in Zone Details panel */
  description: string;
}

// ─── Camera ──────────────────────────────────────────────────────────────────

export interface CameraNode {
  id: string;
  x: number;
  y: number;
  zoneId: string;
  status: 'active' | 'offline' | 'degraded';
  angleDeg: number; // rotation of camera icon
}

// ─── Digital Twin UI State ────────────────────────────────────────────────────

export interface DigitalTwinUIState {
  /** Zone explicitly selected by the operator */
  selectedZoneId: string | null;
  /** Zone currently hovered for tooltip display */
  hoveredZoneId: string | null;
  /** Which overlays are currently visible */
  activeOverlays: Record<OverlayType, boolean>;
  /** Active animated operational routes */
  activeRoutes: OperationalRoute[];
  /** Whether camera should auto-follow active incident */
  isCameraFollowActive: boolean;
}
