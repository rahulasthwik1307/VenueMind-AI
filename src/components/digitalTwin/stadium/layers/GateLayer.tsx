'use client';

/**
 * GateLayer — Stadium Entry Gates
 *
 * Renders Gates A–F as operational entry points around the stadium perimeter.
 * Shows status indicators and crowd pressure context.
 */

import { m } from 'framer-motion';
import { StadiumZoneConfig } from '@/types/digitalTwin';

interface GateLayerProps {
  zones: StadiumZoneConfig[];
  selectedZoneId: string | null;
  hoveredZoneId: string | null;
  zoneCrowdDensity: Record<string, number>;
  onZoneClick: (zoneId: string) => void;
  onZoneHover: (zoneId: string | null) => void;
}

const GATE_ZONE_IDS = new Set(['gate-a', 'gate-b', 'gate-c', 'gate-d', 'gate-e', 'gate-f']);

function gateStatusColor(density: number): string {
  if (density >= 80) return '#dc2626';
  if (density >= 60) return '#d97706';
  if (density >= 40) return '#e6a800';
  return '#16a34a';
}

export function GateLayer({
  zones,
  selectedZoneId,
  hoveredZoneId,
  zoneCrowdDensity,
  onZoneClick,
  onZoneHover,
}: GateLayerProps) {
  const gateZones = zones.filter((z) => GATE_ZONE_IDS.has(z.id));

  return (
    <g aria-label="Stadium gates">
      <style>{`
        @keyframes gateFlow {
          to {
            stroke-dashoffset: -12;
          }
        }
        .animated-gate-flow {
          animation: gateFlow 1s linear infinite;
        }
      `}</style>

      {gateZones.map((zone, idx) => {
        const isSelected = selectedZoneId === zone.id;
        const isHovered = hoveredZoneId === zone.id;
        const density = zoneCrowdDensity[zone.id] ?? 30;
        const statusColor = gateStatusColor(density);

        return (
          <m.g
            key={zone.id}
            style={{ cursor: 'pointer' }}
            onClick={() => onZoneClick(zone.id)}
            onMouseEnter={() => onZoneHover(zone.id)}
            onMouseLeave={() => onZoneHover(null)}
            role="button"
            aria-label={`${zone.name} — click to view gate status`}
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onZoneClick(zone.id);
              }
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 + idx * 0.05 }}
          >
            {/* Gate rectangle */}
            <path
              d={zone.svgPath}
              fill={isSelected ? 'var(--primary-light)' : isHovered ? 'var(--surface-3)' : 'var(--surface-1)'}
              stroke={isSelected ? 'var(--primary)' : statusColor}
              strokeWidth={isSelected ? 2 : 1.5}
              rx={2}
            />

            {/* Marching ants flow around selected gate */}
            {isSelected && (
              <path
                d={zone.svgPath}
                fill="none"
                stroke="var(--foreground)"
                strokeWidth={2.2}
                strokeDasharray="4 2"
                className="animated-gate-flow"
                style={{
                  animationDuration: `${Math.max(0.3, 1.5 - (density / 100) * 1.2)}s`
                }}
              />
            )}

            {/* Gate status dot */}
            <circle
              cx={zone.labelPosition.x}
              cy={zone.labelPosition.y - 15}
              r={3.5}
              fill={statusColor}
              opacity={0.9}
            />

            {/* Gate label */}
            <text
              x={zone.labelPosition.x}
              y={zone.labelPosition.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={10}
              fontWeight={700}
              fill={isSelected ? 'var(--primary)' : 'var(--foreground-muted)'}
              fontFamily="var(--font-mono, monospace)"
              letterSpacing={0.5}
              pointerEvents="none"
              style={{ userSelect: 'none' }}
            >
              {zone.shortName}
            </text>
          </m.g>
        );
      })}
    </g>
  );
}
