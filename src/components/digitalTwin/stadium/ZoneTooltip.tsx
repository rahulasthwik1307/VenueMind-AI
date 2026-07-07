'use client';

/**
 * ZoneTooltip — Floating Zone Information Tooltip
 *
 * Appears on hover over any stadium zone. Shows zone name,
 * crowd density, status, and capacity. Positioned relative to SVG.
 */

import { m, AnimatePresence } from 'framer-motion';
import { StadiumZoneConfig, ZoneStatus } from '@/types/digitalTwin';
import { crowdDensityColor, deriveZoneStatus } from '@/utils/digitalTwin';

interface ZoneTooltipProps {
  hoveredZoneId: string | null;
  zones: StadiumZoneConfig[];
  zoneCrowdDensity: Record<string, number>;
  incidents: Array<{ id: string; status: string; category: string; severity: string; location: { zone: string } }>;
}

const STATUS_LABELS: Record<ZoneStatus, string> = {
  normal: 'Normal',
  busy: 'Busy',
  high: 'High Pressure',
  critical: 'Critical',
  closed: 'Closed',
  evacuating: 'EVACUATING',
};

const STATUS_COLORS: Record<ZoneStatus, string> = {
  normal: '#16a34a',
  busy: '#e6a800',
  high: '#d97706',
  critical: '#dc2626',
  closed: '#374151',
  evacuating: '#dc2626',
};

export function ZoneTooltip({
  hoveredZoneId,
  zones,
  zoneCrowdDensity,
  incidents,
}: ZoneTooltipProps) {
  const zone = hoveredZoneId ? zones.find((z) => z.id === hoveredZoneId) : null;

  return (
    <AnimatePresence>
      {zone && (
        <m.g
          key={zone.id}
          aria-hidden="true"
          pointerEvents="none"
          initial={{ opacity: 0, scale: 0.9, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
        >
          <TooltipBox zone={zone} zoneCrowdDensity={zoneCrowdDensity} incidents={incidents} />
        </m.g>
      )}
    </AnimatePresence>
  );
}

function TooltipBox({
  zone,
  zoneCrowdDensity,
  incidents,
}: {
  zone: StadiumZoneConfig;
  zoneCrowdDensity: Record<string, number>;
  incidents: ZoneTooltipProps['incidents'];
}) {
  const density = zoneCrowdDensity[zone.id] ?? 30;
  const status = deriveZoneStatus(zone.id, density, incidents as Parameters<typeof deriveZoneStatus>[2]);
  const densityColor = crowdDensityColor(density);
  const statusLabel = STATUS_LABELS[status];
  const statusColor = STATUS_COLORS[status];

  // Position tooltip above the zone label, clamped to viewport
  const tx = Math.min(720, Math.max(80, zone.labelPosition.x));
  const ty = Math.max(40, zone.labelPosition.y - 70);

  const barWidth = 72;
  const filledWidth = (density / 100) * barWidth;

  return (
    <g transform={`translate(${tx - 65}, ${ty})`}>
      {/* Background */}
      <rect
        width={130}
        height={62}
        rx={6}
        fill="var(--surface-1)"
        opacity={0.94}
      />
      <rect
        width={130}
        height={62}
        rx={6}
        fill="none"
        stroke="var(--border)"
        strokeWidth={1}
      />

      {/* Zone name */}
      <text
        x={10}
        y={16}
        fontSize={8.5}
        fontWeight={700}
        fill="var(--foreground)"
        fontFamily="var(--font-sans, sans-serif)"
      >
        {zone.name}
      </text>

      {/* Status badge */}
      <rect x={10} y={22} width={64} height={11} rx={3} fill={statusColor} opacity={0.9} />
      <text
        x={42}
        y={27}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={6.5}
        fontWeight={700}
        fill="#ffffff"
        fontFamily="var(--font-mono, monospace)"
        letterSpacing={0.5}
      >
        {statusLabel}
      </text>

      {/* Crowd density bar */}
      <text x={10} y={41} fontSize={6.5} fill="var(--foreground-subtle)" fontFamily="var(--font-mono, monospace)">
        CROWD
      </text>
      <text
        x={120}
        y={41}
        textAnchor="end"
        fontSize={6.5}
        fontWeight={600}
        fill={densityColor}
        fontFamily="var(--font-mono, monospace)"
      >
        {Math.round(density)}%
      </text>
      <rect x={10} y={44} width={barWidth} height={5} rx={2.5} fill="var(--surface-3)" />
      <rect x={10} y={44} width={filledWidth} height={5} rx={2.5} fill={densityColor} opacity={0.9} />

      {/* Capacity */}
      <text
        x={10}
        y={58}
        fontSize={6}
        fill="var(--foreground-subtle)"
        fontFamily="var(--font-mono, monospace)"
      >
        Cap: {zone.capacity.toLocaleString()}
      </text>
    </g>
  );
}
