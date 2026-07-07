/**
 * Digital Twin Utility Functions
 *
 * Pure helper functions for the Interactive Stadium Digital Twin.
 * These belong here (utils/) and NOT inside components or hooks.
 *
 * Covers:
 *  - Crowd density color interpolation
 *  - Route color mapping
 *  - Incident location → zone ID mapping
 *  - Route path generation (Bézier curves)
 *  - Zone status derivation
 */

import type { Incident } from '@/types/incident';
import type { Recommendation } from '@/types/incident';
import type { StadiumTelemetry } from '@/types/telemetry';
import type { OperationalRoute, RouteType, ZoneStatus } from '@/types/digitalTwin';
import { ROUTE_ORIGINS } from '@/data/stadium/stadiumZones';

// ─── Crowd Density Color ──────────────────────────────────────────────────────

/**
 * Returns a CSS color string representing crowd density pressure.
 * Uses the VenueMind AI design token palette for semantic status colors.
 */
export function crowdDensityColor(density: number): string {
  if (density <= 40) {
    const t = density / 40;
    return interpolateHex('#16a34a', '#e6a800', t);
  }
  if (density <= 60) {
    const t = (density - 40) / 20;
    return interpolateHex('#e6a800', '#d97706', t);
  }
  if (density <= 80) {
    const t = (density - 60) / 20;
    return interpolateHex('#d97706', '#dc2626', t);
  }
  return '#dc2626';
}

function interpolateHex(from: string, to: string, t: number): string {
  const r1 = parseInt(from.slice(1, 3), 16);
  const g1 = parseInt(from.slice(3, 5), 16);
  const b1 = parseInt(from.slice(5, 7), 16);
  const r2 = parseInt(to.slice(1, 3), 16);
  const g2 = parseInt(to.slice(3, 5), 16);
  const b2 = parseInt(to.slice(5, 7), 16);
  const r = Math.round(r1 + (r2 - r1) * Math.min(1, Math.max(0, t)));
  const g = Math.round(g1 + (g2 - g1) * Math.min(1, Math.max(0, t)));
  const b = Math.round(b1 + (b2 - b1) * Math.min(1, Math.max(0, t)));
  return `rgb(${r},${g},${b})`;
}

// ─── Route Colors ─────────────────────────────────────────────────────────────

export const ROUTE_COLORS: Record<RouteType, string> = {
  medical: '#dc2626',
  security: '#0f5132',
  volunteer: '#7c3aed',
  vip: '#e6a800',
  transport: '#3b82f6',
  evacuation: '#d97706',
};

export function routeColor(type: RouteType): string {
  return ROUTE_COLORS[type];
}

// ─── Severity Helpers ─────────────────────────────────────────────────────────

export function severityWeight(severity: Incident['severity']): number {
  switch (severity) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

export function severityColor(severity: Incident['severity']): string {
  switch (severity) {
    case 'critical': return '#dc2626';
    case 'high': return '#d97706';
    case 'medium': return '#e6a800';
    case 'low': return '#16a34a';
    default: return '#6b7280';
  }
}

// ─── Incident Location → Zone ID Mapping ─────────────────────────────────────

/**
 * Maps an incident's `location.zone` string (free-text) to a Stadium zone ID.
 * Uses keyword matching against known zone names.
 */
export function mapIncidentLocationToZoneId(locationZone: string): string | null {
  const lower = locationZone.toLowerCase();

  // Seating stands
  if (lower.includes('north stand') || lower.includes('gate a') || lower.includes('gate 7')) return 'north-stand';
  if (lower.includes('south stand') || lower.includes('gate d')) return 'south-stand';
  if (lower.includes('east stand') || lower.includes('sector b') || lower.includes('sector c')) return 'east-stand';
  if (lower.includes('west stand') || lower.includes('sector a')) return 'west-stand';

  // Premium zones
  if (lower.includes('vip') || lower.includes('executive')) return 'vip';
  if (lower.includes('hospitality') || lower.includes('corporate')) return 'hospitality';
  if (lower.includes('media') || lower.includes('press')) return 'media';

  // Operations
  if (lower.includes('command') || lower.includes('operations center') || lower.includes('ops center')) return 'command-center';
  if (lower.includes('security hq') || lower.includes('security hub')) return 'security-hq';
  if (lower.includes('medical hq') || lower.includes('first aid') || lower.includes('medical center')) return 'medical-hq';
  if (lower.includes('volunteer') || lower.includes('steward')) return 'volunteer-hq';

  // Specific gates
  if (lower.includes('gate b') || lower.includes('gate 2')) return 'gate-b';
  if (lower.includes('gate c') || lower.includes('gate 3')) return 'gate-c';
  if (lower.includes('gate e') || lower.includes('gate 5')) return 'gate-e';
  if (lower.includes('gate f') || lower.includes('gate 6')) return 'gate-f';
  if (lower.includes('gate a') || lower.includes('gate 1') || lower.includes('north gate')) return 'gate-a';
  if (lower.includes('gate d') || lower.includes('gate 4') || lower.includes('south gate')) return 'gate-d';

  // Transport / external
  if (lower.includes('bus') || lower.includes('shuttle')) return 'bus-hub';
  if (lower.includes('metro') || lower.includes('subway') || lower.includes('underground')) return 'metro';
  if (lower.includes('taxi') || lower.includes('ride share') || lower.includes('rideshare')) return 'taxi';
  if (lower.includes('parking') && lower.includes('ne')) return 'parking-a';
  if (lower.includes('parking') && lower.includes('nw')) return 'parking-b';
  if (lower.includes('parking')) return 'parking-a';

  // Infrastructure
  if (lower.includes('cctv') || lower.includes('camera hub')) return 'cctv-hub';
  if (lower.includes('transport') || lower.includes('transit')) return 'bus-hub';

  return null;
}

// ─── Zone Crowd Density ───────────────────────────────────────────────────────

/**
 * Deterministic per-zone density offsets (avoid random on each render).
 * These represent typical variation from the global crowd density.
 */
const ZONE_DENSITY_OFFSETS: Partial<Record<string, number>> = {
  'north-stand': 2,
  'south-stand': -3,
  'east-stand': 5,
  'west-stand': -1,
  'vip': -20,         // VIP is always less crowded per m²
  'hospitality': -15,
  'media': -25,       // Controlled access
  'gate-a': 8,
  'gate-b': 4,
  'gate-c': 3,
  'gate-d': 6,
  'gate-e': 2,
  'gate-f': 1,
  'bus-hub': 0,
  'metro': 5,
  'taxi': -10,
  'parking-a': -20,
  'parking-b': -20,
};

/**
 * Computes per-zone crowd density (0–100) based on:
 * 1. Base density from telemetry
 * 2. Per-zone offset (deterministic)
 * 3. Active incident modifiers (crowd incidents raise local density)
 * 4. Transport status for external zones
 */
export function computeZoneCrowdDensity(
  telemetry: StadiumTelemetry | null,
  incidents: Incident[],
): Record<string, number> {
  const baseDensity = telemetry?.crowdDensity.value ?? 30;
  const result: Record<string, number> = {};

  // Apply base density + deterministic offset to all zones
  Object.entries(ZONE_DENSITY_OFFSETS).forEach(([zoneId, offset]) => {
    result[zoneId] = Math.max(0, Math.min(100, baseDensity + (offset ?? 0)));
  });

  // Apply incident modifiers
  incidents
    .filter((i) => i.status !== 'resolved')
    .forEach((inc) => {
      const zoneId = mapIncidentLocationToZoneId(inc.location.zone);
      if (!zoneId) return;
      const modifier =
        inc.severity === 'critical' ? 28 :
        inc.severity === 'high' ? 18 :
        inc.severity === 'medium' ? 10 : 4;
      result[zoneId] = Math.min(100, (result[zoneId] ?? baseDensity) + modifier);
    });

  // External zone density derives from transport status
  const transportStatus = telemetry?.transportStatus.value ?? 'Good';
  const externalDensity =
    transportStatus === 'Critical' ? 88 :
    transportStatus === 'Congested' ? 68 :
    transportStatus === 'Delayed' ? 48 : 22;

  result['bus-hub'] = externalDensity;
  result['metro'] = Math.min(100, externalDensity + 10);
  result['taxi'] = Math.max(5, externalDensity - 15);

  return result;
}

// ─── Zone Status Derivation ───────────────────────────────────────────────────

/**
 * Derives the operational ZoneStatus from crowd density and active incidents.
 */
export function deriveZoneStatus(
  zoneId: string,
  density: number,
  incidents: Incident[],
): ZoneStatus {
  const hasEvacuation = incidents.some(
    (i) =>
      mapIncidentLocationToZoneId(i.location.zone) === zoneId &&
      i.status !== 'resolved' &&
      i.category === 'security' &&
      i.severity === 'critical',
  );
  if (hasEvacuation) return 'evacuating';

  const hasClosure = incidents.some(
    (i) =>
      mapIncidentLocationToZoneId(i.location.zone) === zoneId &&
      i.status !== 'resolved' &&
      (i.category === 'infrastructure' || i.category === 'security') &&
      i.severity === 'critical',
  );
  if (hasClosure) return 'closed';

  if (density >= 85) return 'critical';
  if (density >= 70) return 'high';
  if (density >= 50) return 'busy';
  return 'normal';
}

// ─── Route Generation ─────────────────────────────────────────────────────────

/**
 * Determines the RouteType to dispatch for a given incident category and recommendation.
 */
export function getRouteTypeForIncident(
  category: Incident['category'],
): RouteType {
  switch (category) {
    case 'medical': return 'medical';
    case 'security': return 'security';
    case 'volunteer': return 'volunteer';
    case 'transport': return 'transport';
    case 'accessibility': return 'volunteer';
    default: return 'security';
  }
}

/**
 * Generates a Bézier SVG path from a route origin to a zone's focus point.
 * Creates a gentle curved path that reads as a dispatch route.
 */
export function generateRoutePath(
  origin: { x: number; y: number },
  dest: { x: number; y: number },
): string {
  const midX = (origin.x + dest.x) / 2;
  const midY = (origin.y + dest.y) / 2;

  // Perpendicular offset for the control point (creates a gentle arc)
  const dx = dest.x - origin.x;
  const dy = dest.y - origin.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const perpOffset = Math.min(80, len * 0.25);

  // Alternate left/right based on x relationship to create visual variety
  const side = origin.x < dest.x ? 1 : -1;
  const cpX = midX - (dy / len) * perpOffset * side;
  const cpY = midY + (dx / len) * perpOffset * side;

  return `M ${origin.x},${origin.y} Q ${cpX},${cpY} ${dest.x},${dest.y}`;
}

/**
 * Generates a full OperationalRoute for a dispatched recommendation.
 */
export function generateRouteForDispatch(
  incident: Incident,
  recommendation: Recommendation,
): OperationalRoute | null {
  const zoneId = mapIncidentLocationToZoneId(incident.location.zone);
  const routeType = getRouteTypeForIncident(incident.category);
  const origin = ROUTE_ORIGINS[routeType];

  // If we don't know the zone, use the incident lat/lng mapped to SVG space
  // (simplified: use center of the stadium as fallback)
  const destination = zoneId
    ? (() => {
        // Look up zone focus point inline to avoid circular import
        const FOCUS_POINTS: Partial<Record<string, { x: number; y: number }>> = {
          'north-stand': { x: 400, y: 186 },
          'south-stand': { x: 400, y: 430 },
          'east-stand': { x: 668, y: 308 },
          'west-stand': { x: 132, y: 308 },
          'vip': { x: 680, y: 248 },
          'hospitality': { x: 680, y: 370 },
          'media': { x: 110, y: 248 },
          'command-center': { x: 117, y: 210 },
          'security-hq': { x: 683, y: 210 },
          'medical-hq': { x: 683, y: 406 },
          'volunteer-hq': { x: 117, y: 406 },
          'gate-a': { x: 400, y: 62 },
          'gate-b': { x: 616, y: 120 },
          'gate-c': { x: 616, y: 500 },
          'gate-d': { x: 400, y: 558 },
          'gate-e': { x: 184, y: 500 },
          'gate-f': { x: 184, y: 120 },
          'bus-hub': { x: 400, y: 21 },
          'metro': { x: 784, y: 308 },
          'taxi': { x: 400, y: 603 },
          'parking-a': { x: 742, y: 90 },
          'parking-b': { x: 58, y: 90 },
          'cctv-hub': { x: 400, y: 119 },
        };
        return FOCUS_POINTS[zoneId] ?? { x: 400, y: 308 };
      })()
    : { x: 400, y: 308 };

  const pathData = generateRoutePath(origin, destination);

  return {
    id: `route-${recommendation.id}-${Date.now()}`,
    type: routeType,
    incidentId: incident.id,
    recommendationId: recommendation.id,
    pathData,
    label: recommendation.title,
    isActive: true,
    startedAt: new Date().toISOString(),
  };
}

// ─── Time Grouping for Activity Feed ─────────────────────────────────────────

export type ActivityTimeGroup = 'now' | 'recent' | 'earlier';

/** Groups an activity timestamp into a display bucket */
export function getActivityTimeGroup(isoTimestamp: string): ActivityTimeGroup {
  const diff = Date.now() - new Date(isoTimestamp).getTime();
  const minutes = diff / 60_000;
  if (minutes <= 5) return 'now';
  if (minutes <= 30) return 'recent';
  return 'earlier';
}
