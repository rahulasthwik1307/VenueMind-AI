'use client';

/**
 * IncidentMarkerLayer — Live Incident Markers
 *
 * Renders severity-coded pulsing markers at incident locations.
 * Each marker maps to the zone computed from the incident's location.zone.
 * Click triggers zone focus and incident panel sync.
 *
 * Visible only when 'incidents' overlay is active.
 */

import { m, AnimatePresence } from 'framer-motion';
import type { Incident } from '@/types/incident';
import { mapIncidentLocationToZoneId, ZONE_OFFSETS } from '@/utils/digitalTwin';
import { getZoneById } from '@/data/stadium/stadiumZones';
import { ZOOM_DETAIL_THRESHOLD } from '@/constants/layout';
import { useIncidentStore } from '@/store/modules/incident';

interface IncidentMarkerLayerProps {
  incidents: Incident[];
  activeIncidentId: string | null;
  isVisible: boolean;
  onIncidentClick: (incidentId: string) => void;
  zoomLevel?: number;
}

const CATEGORY_ABBREVIATIONS: Record<string, string> = {
  crowd: 'CR',
  medical: 'MD',
  security: 'SC',
  infrastructure: 'IN',
  transport: 'TR',
  weather: 'WX',
  volunteer: 'VL',
  accessibility: 'AC',
};

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#dc2626';
    case 'high':
    case 'medium': return '#d97706';
    case 'low': return '#16a34a';
    default: return '#3b82f6'; // Informational / Blue
  }
}

function getCategoryShapePath(category: string, cx: number, cy: number, r: number): string {
  switch (category) {
    case 'security':
      // Shield shape centered at (cx, cy)
      const sy = r * 0.9;
      return `M ${cx} ${cy - sy} L ${cx + sy} ${cy - sy} A ${r} ${r} 0 0 1 ${cx + sy} ${cy + 1} C ${cx + sy} ${cy + r * 0.7} ${cx} ${cy + r} ${cx} ${cy + r} C ${cx} ${cy + r} ${cx - sy} ${cy + r * 0.7} ${cx - sy} ${cy + 1} A ${r} ${r} 0 0 1 ${cx - sy} ${cy - sy} Z`;
    case 'medical':
      // Cross shape centered at (cx, cy)
      const w = r * 0.25;
      const l = r * 0.75;
      return `M ${cx - l} ${cy - w} L ${cx - w} ${cy - w} L ${cx - w} ${cy - l} L ${cx + w} ${cy - l} L ${cx + w} ${cy - w} L ${cx + l} ${cy - w} L ${cx + l} ${cy + w} L ${cx + w} ${cy + w} L ${cx + w} ${cy + l} ${cx - w} ${cy + l} ${cx - w} ${cy + w} L ${cx - l} ${cy + w} Z`;
    case 'transport':
    case 'parking':
    case 'infrastructure':
      // Diamond shape centered at (cx, cy)
      const d = r * 0.9;
      return `M ${cx} ${cy - d} L ${cx + d} ${cy} L ${cx} ${cy + d} L ${cx - d} ${cy} Z`;
    case 'volunteer':
    default:
      // Fallback to circle
      return '';
  }
}

export function IncidentMarkerLayer({
  incidents,
  activeIncidentId,
  isVisible,
  onIncidentClick,
  zoomLevel = 1,
}: IncidentMarkerLayerProps) {
  const hoveredIncidentId = useIncidentStore((s) => s.hoveredIncidentId);
  const setHoveredIncidentId = useIncidentStore((s) => s.setHoveredIncidentId);

  if (!isVisible) return null;

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');

  // Track how many markers are in each zone to apply offsets
  const zoneMarkerIndex: Record<string, number> = {};
  const showDetail = zoomLevel >= ZOOM_DETAIL_THRESHOLD;

  return (
    <g aria-label="Incident markers">
      <AnimatePresence>
        {activeIncidents.map((incident) => {
          const zoneId = mapIncidentLocationToZoneId(incident.location.zone);
          const zone = zoneId ? getZoneById(zoneId) : null;
          if (!zone) return null;

          // Compute position with offset to spread multiple markers in same zone
          const zoneCount = zoneMarkerIndex[zoneId ?? ''] ?? 0;
          zoneMarkerIndex[zoneId ?? ''] = zoneCount + 1;

          const offsets = ZONE_OFFSETS[zoneId ?? ''] ?? [{ dx: 0, dy: 0 }];
          const offset = offsets[zoneCount % offsets.length];

          const cx = zone.focusPoint.x + (offset?.dx ?? 0);
          const cy = zone.focusPoint.y + (offset?.dy ?? 0);

          const isActive = incident.id === activeIncidentId;
          const isHovered = incident.id === hoveredIncidentId;
          const color = getSeverityColor(incident.severity);
          const abbr = CATEGORY_ABBREVIATIONS[incident.category] ?? '??';

          // Base sizing
          const r = isActive ? 11 : isHovered ? 9.5 : 8;
          const shapePath = getCategoryShapePath(incident.category, cx, cy, r);

          return (
            <m.g
              key={incident.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onIncidentClick(incident.id)}
              onMouseEnter={() => setHoveredIncidentId(incident.id)}
              onMouseLeave={() => setHoveredIncidentId(null)}
              role="button"
              aria-label={`${incident.severity} incident: ${incident.title}`}
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onIncidentClick(incident.id);
                }
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
            >
              {/* Outer pulse ring (only for critical/high, only at detail zoom) */}
              {showDetail && (incident.severity === 'critical' || incident.severity === 'high') && (
                <m.circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? 18 : 13}
                  fill={color}
                  opacity={0}
                  animate={{
                    r: [isActive ? 18 : 13, isActive ? 26 : 20],
                    opacity: [0.35, 0],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              )}

              {/* Secondary pulse ring */}
              <m.circle
                cx={cx}
                cy={cy}
                r={isActive ? 13 : 9}
                fill={color}
                opacity={0.12}
                animate={{ opacity: [0.12, 0.04, 0.12] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Active selection rotating outer guide ring */}
              {isActive && (
                <m.circle
                  cx={cx}
                  cy={cy}
                  r={r + 4.5}
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth={1.2}
                  strokeDasharray="4 2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  style={{ originX: `${cx}px`, originY: `${cy}px` }}
                />
              )}

              {/* Main marker shape */}
              {showDetail && shapePath ? (
                <m.path
                  d={shapePath}
                  fill={isActive ? color : isHovered ? `${color}ee` : `${color}cc`}
                  stroke="#ffffff"
                  strokeWidth={isActive ? 2 : isHovered ? 1.5 : 1.2}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    filter: isActive || isHovered
                      ? `drop-shadow(0 0 5px ${color}88)`
                      : undefined,
                  }}
                />
              ) : (
                <m.circle
                  cx={cx}
                  cy={cy}
                  r={showDetail ? r : (isActive ? 8 : isHovered ? 7 : 5.5)}
                  fill={isActive ? color : isHovered ? `${color}ee` : `${color}cc`}
                  stroke="#ffffff"
                  strokeWidth={isActive ? 2 : isHovered ? 1.5 : 1.2}
                  style={{
                    filter: isActive || isHovered
                      ? `drop-shadow(0 0 5px ${color}88)`
                      : undefined,
                  }}
                />
              )}

              {/* Category abbreviation (shown only above zoom threshold) */}
              {showDetail && (
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={isActive ? 6.5 : isHovered ? 6 : 5.5}
                  fontWeight={700}
                  fill="#ffffff"
                  fontFamily="var(--font-mono, monospace)"
                  pointerEvents="none"
                  style={{ userSelect: 'none' }}
                >
                  {abbr}
                </text>
              )}

              {/* Active badge */}
              {isActive && showDetail && (
                <m.circle
                  cx={cx + r - 2}
                  cy={cy - r + 2}
                  r={3.5}
                  fill="#16a34a"
                  stroke="#ffffff"
                  strokeWidth={1}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                />
              )}
            </m.g>
          );
        })}
      </AnimatePresence>
    </g>
  );
}
