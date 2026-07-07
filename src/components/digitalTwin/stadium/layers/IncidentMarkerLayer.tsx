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
import { mapIncidentLocationToZoneId, severityColor } from '@/utils/digitalTwin';
import { getZoneById } from '@/data/stadium/stadiumZones';

interface IncidentMarkerLayerProps {
  incidents: Incident[];
  activeIncidentId: string | null;
  isVisible: boolean;
  onIncidentClick: (incidentId: string) => void;
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

/** Small jitter to spread markers in same zone slightly */
const ZONE_OFFSETS: Record<string, Array<{ dx: number; dy: number }>> = {
  'north-stand': [{ dx: 0, dy: 0 }, { dx: 25, dy: -5 }, { dx: -20, dy: 8 }],
  'south-stand': [{ dx: 0, dy: 0 }, { dx: -20, dy: 5 }, { dx: 25, dy: -8 }],
  'east-stand': [{ dx: 0, dy: 0 }, { dx: 5, dy: 25 }, { dx: -5, dy: -20 }],
  'west-stand': [{ dx: 0, dy: 0 }, { dx: -5, dy: -20 }, { dx: 5, dy: 22 }],
};

export function IncidentMarkerLayer({
  incidents,
  activeIncidentId,
  isVisible,
  onIncidentClick,
}: IncidentMarkerLayerProps) {
  if (!isVisible) return null;

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved');

  // Track how many markers are in each zone to apply offsets
  const zoneMarkerIndex: Record<string, number> = {};

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
          const color = severityColor(incident.severity);
          const abbr = CATEGORY_ABBREVIATIONS[incident.category] ?? '??';

          return (
            <m.g
              key={incident.id}
              style={{ cursor: 'pointer' }}
              onClick={() => onIncidentClick(incident.id)}
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
              {/* Outer pulse ring (only for critical/high) */}
              {(incident.severity === 'critical' || incident.severity === 'high') && (
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
                opacity={0.15}
                animate={{ opacity: [0.15, 0.05, 0.15] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Main marker circle */}
              <m.circle
                cx={cx}
                cy={cy}
                r={isActive ? 11 : 8}
                fill={isActive ? color : `${color}dd`}
                stroke="#ffffff"
                strokeWidth={isActive ? 2 : 1.5}
                animate={{ r: isActive ? 11 : 8 }}
                transition={{ duration: 0.25 }}
                style={{
                  filter: isActive
                    ? `drop-shadow(0 0 6px ${color}88)`
                    : undefined,
                }}
              />

              {/* Category abbreviation */}
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={isActive ? 6.5 : 5.5}
                fontWeight={700}
                fill="#ffffff"
                fontFamily="var(--font-mono, monospace)"
                pointerEvents="none"
                style={{ userSelect: 'none' }}
              >
                {abbr}
              </text>

              {/* Active badge */}
              {isActive && (
                <m.circle
                  cx={cx + 9}
                  cy={cy - 9}
                  r={4}
                  fill="#0f5132"
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
