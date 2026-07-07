'use client';

/**
 * OperationsLayer — Stadium Operations Zones
 *
 * Renders Command Center, Security HQ, Medical HQ, Volunteer HQ,
 * and CCTV Hub as labeled operational nodes.
 */

import { m } from 'framer-motion';
import { StadiumZoneConfig } from '@/types/digitalTwin';

interface OperationsLayerProps {
  zones: StadiumZoneConfig[];
  selectedZoneId: string | null;
  hoveredZoneId: string | null;
  onZoneClick: (zoneId: string) => void;
  onZoneHover: (zoneId: string | null) => void;
}

const OPS_ZONE_IDS = new Set([
  'command-center',
  'security-hq',
  'medical-hq',
  'volunteer-hq',
  'cctv-hub',
]);

const ZONE_ICON_LABELS: Record<string, string> = {
  'command-center': 'CMD',
  'security-hq': 'SEC',
  'medical-hq': '✚',
  'volunteer-hq': 'VOL',
  'cctv-hub': '📷',
};

export function OperationsLayer({
  zones,
  selectedZoneId,
  hoveredZoneId,
  onZoneClick,
  onZoneHover,
}: OperationsLayerProps) {
  const opsZones = zones.filter((z) => OPS_ZONE_IDS.has(z.id));

  return (
    <g aria-label="Operations zones">
      {opsZones.map((zone, idx) => {
        const isSelected = selectedZoneId === zone.id;
        const isHovered = hoveredZoneId === zone.id;

        return (
          <m.g
            key={zone.id}
            style={{ cursor: 'pointer' }}
            onClick={() => onZoneClick(zone.id)}
            onMouseEnter={() => onZoneHover(zone.id)}
            onMouseLeave={() => onZoneHover(null)}
            role="button"
            aria-label={`${zone.name} — operational zone`}
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onZoneClick(zone.id);
              }
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 + idx * 0.06 }}
          >
            {/* Zone background */}
            <path
              d={zone.svgPath}
              fill={isSelected ? zone.defaultColor : `${zone.defaultColor}cc`}
              stroke={isSelected ? zone.defaultColor : `${zone.defaultColor}80`}
              strokeWidth={isSelected ? 2 : 1}
              rx={4}
            />

            {/* Highlight ring when selected */}
            {isSelected && (
              <path
                d={zone.svgPath}
                fill="none"
                stroke={zone.defaultColor}
                strokeWidth={3}
                opacity={0.4}
              />
            )}

            {/* Icon label */}
            <text
              x={zone.labelPosition.x}
              y={zone.labelPosition.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={7}
              fontWeight={700}
              fill="#ffffff"
              fontFamily="var(--font-mono, monospace)"
              letterSpacing={0.8}
              pointerEvents="none"
              style={{ userSelect: 'none' }}
            >
              {ZONE_ICON_LABELS[zone.id] ?? zone.shortName}
            </text>

            {/* Hover tooltip name */}
            {isHovered && (
              <g>
                <rect
                  x={zone.labelPosition.x - 24}
                  y={zone.labelPosition.y - 22}
                  width={48}
                  height={14}
                  fill="#111827"
                  rx={3}
                  opacity={0.85}
                />
                <text
                  x={zone.labelPosition.x}
                  y={zone.labelPosition.y - 15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={6.5}
                  fontWeight={600}
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
