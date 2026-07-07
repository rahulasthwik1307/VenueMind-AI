'use client';

/**
 * SeatingLayer — Stadium Seating Sections
 *
 * Renders the four main stands + VIP/Hospitality/Media premium sections
 * from the centralized stadiumZones configuration. Handles hover and
 * selection interactions. Crowd density coloring is handled by the
 * separate CrowdDensityLayer overlay.
 */

import { m } from 'framer-motion';
import { StadiumZoneConfig, ZoneStatus } from '@/types/digitalTwin';

interface SeatingLayerProps {
  zones: StadiumZoneConfig[];
  selectedZoneId: string | null;
  hoveredZoneId: string | null;
  onZoneClick: (zoneId: string) => void;
  onZoneHover: (zoneId: string | null) => void;
  zoneStatuses: Record<string, ZoneStatus>;
}

const SEATING_ZONE_IDS = new Set([
  'north-stand', 'south-stand', 'east-stand', 'west-stand',
  'vip', 'hospitality', 'media',
]);

const STATUS_STROKE: Record<ZoneStatus, string> = {
  normal: 'rgba(15, 81, 50, 0.12)',
  busy: '#e6a800',
  high: '#d97706',
  critical: '#dc2626',
  closed: '#374151',
  evacuating: '#dc2626',
};

export function SeatingLayer({
  zones,
  selectedZoneId,
  hoveredZoneId,
  onZoneClick,
  onZoneHover,
  zoneStatuses,
}: SeatingLayerProps) {
  const seatingZones = zones.filter((z) => SEATING_ZONE_IDS.has(z.id));

  return (
    <g aria-label="Seating stands">
      {seatingZones.map((zone) => {
        const isSelected = selectedZoneId === zone.id;
        const isHovered = hoveredZoneId === zone.id;
        const status = zoneStatuses[zone.id] ?? 'normal';

        return (
          <m.path
            key={zone.id}
            d={zone.svgPath}
            fill={zone.defaultColor}
            stroke={isSelected ? 'var(--primary, #0f5132)' : STATUS_STROKE[status]}
            strokeWidth={isSelected ? 2.5 : status !== 'normal' ? 1.5 : 1}
            opacity={isHovered && !isSelected ? 0.85 : 1}
            style={{ cursor: 'pointer' }}
            onClick={() => onZoneClick(zone.id)}
            onMouseEnter={() => onZoneHover(zone.id)}
            onMouseLeave={() => onZoneHover(null)}
            role="button"
            aria-label={`${zone.name} — click to view zone details`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onZoneClick(zone.id);
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          />
        );
      })}

      {/* Zone labels */}
      {seatingZones.map((zone) => {
        const isSelected = selectedZoneId === zone.id;
        return (
          <text
            key={`label-${zone.id}`}
            x={zone.labelPosition.x}
            y={zone.labelPosition.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={zone.type === 'seating' ? 8.5 : 7}
            fontWeight={isSelected ? 700 : 500}
            fill={isSelected ? '#0f5132' : '#4b5563'}
            fontFamily="var(--font-sans, sans-serif)"
            letterSpacing={0.5}
            pointerEvents="none"
            style={{ userSelect: 'none' }}
          >
            {zone.shortName}
          </text>
        );
      })}

      {/* Track / concourse area (inner oval minus pitch zone) */}
      <ellipse
        cx={400}
        cy={308}
        rx={242}
        ry={186}
        fill="#dde3e0"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth={1}
        pointerEvents="none"
        style={{ zIndex: -1 }}
      />

      {/* Running track ring at concourse perimeter */}
      <ellipse
        cx={400}
        cy={308}
        rx={242}
        ry={186}
        fill="none"
        stroke="rgba(120,150,130,0.25)"
        strokeWidth={4}
        pointerEvents="none"
      />
    </g>
  );
}
