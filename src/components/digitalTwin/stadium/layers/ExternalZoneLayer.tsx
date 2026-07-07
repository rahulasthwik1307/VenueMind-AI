'use client';

/**
 * ExternalZoneLayer — External Transport & Parking Zones
 *
 * Renders Bus Hub, Metro Station, Taxi/Ride Share, and Parking zones
 * outside the stadium perimeter. Transport status drives color coding.
 */

import { m } from 'framer-motion';
import { StadiumZoneConfig } from '@/types/digitalTwin';

interface ExternalZoneLayerProps {
  zones: StadiumZoneConfig[];
  selectedZoneId: string | null;
  hoveredZoneId: string | null;
  zoneCrowdDensity: Record<string, number>;
  transportOverlayActive: boolean;
  onZoneClick: (zoneId: string) => void;
  onZoneHover: (zoneId: string | null) => void;
}

const EXTERNAL_ZONE_IDS = new Set([
  'bus-hub', 'metro', 'taxi', 'parking-a', 'parking-b',
]);

const TRANSPORT_ICONS: Record<string, string> = {
  'bus-hub': 'BUS',
  'metro': 'MRT',
  'taxi': 'TAXI',
  'parking-a': 'P',
  'parking-b': 'P',
};

function externalDensityColor(density: number): string {
  if (density >= 80) return '#dc2626';
  if (density >= 60) return '#d97706';
  if (density >= 40) return '#e6a800';
  return '#3b82f6';
}

export function ExternalZoneLayer({
  zones,
  selectedZoneId,
  hoveredZoneId,
  zoneCrowdDensity,
  onZoneClick,
  onZoneHover,
}: ExternalZoneLayerProps) {
  const externalZones = zones.filter((z) => EXTERNAL_ZONE_IDS.has(z.id));

  return (
    <g aria-label="External transport zones">
      {externalZones.map((zone, idx) => {
        const isSelected = selectedZoneId === zone.id;
        const isHovered = hoveredZoneId === zone.id;
        const density = zoneCrowdDensity[zone.id] ?? 25;
        const statusColor = externalDensityColor(density);

        return (
          <m.g
            key={zone.id}
            style={{ cursor: 'pointer' }}
            onClick={() => onZoneClick(zone.id)}
            onMouseEnter={() => onZoneHover(zone.id)}
            onMouseLeave={() => onZoneHover(null)}
            role="button"
            aria-label={`${zone.name} — transport zone`}
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onZoneClick(zone.id);
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.45 + idx * 0.05 }}
          >
            {/* Background */}
            <path
              d={zone.svgPath}
              fill={isSelected ? statusColor : `${statusColor}33`}
              stroke={statusColor}
              strokeWidth={isSelected ? 2 : 1}
              strokeDasharray={isSelected ? 'none' : '3 2'}
              rx={3}
            />

            {/* Zone label */}
            <text
              x={zone.labelPosition.x}
              y={zone.labelPosition.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={6.5}
              fontWeight={700}
              fill={isSelected ? '#ffffff' : statusColor}
              fontFamily="var(--font-mono, monospace)"
              letterSpacing={0.8}
              pointerEvents="none"
              style={{ userSelect: 'none' }}
            >
              {TRANSPORT_ICONS[zone.id] ?? zone.shortName}
            </text>

            {/* Hover name tooltip */}
            {isHovered && (
              <g>
                <rect
                  x={zone.labelPosition.x - 22}
                  y={zone.labelPosition.y + 8}
                  width={44}
                  height={13}
                  fill="#111827"
                  rx={2}
                  opacity={0.85}
                />
                <text
                  x={zone.labelPosition.x}
                  y={zone.labelPosition.y + 14}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={6}
                  fill="#ffffff"
                  pointerEvents="none"
                >
                  {zone.shortName}
                </text>
              </g>
            )}
          </m.g>
        );
      })}
    </g>
  );
}
