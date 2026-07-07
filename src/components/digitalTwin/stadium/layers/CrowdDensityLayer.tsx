'use client';

/**
 * CrowdDensityLayer — Crowd Pressure Heat Overlay
 *
 * Renders semi-transparent colored overlays across seating areas, gates,
 * concourse access points, and external transport hubs, reflecting
 * real-time crowd pressure from telemetry and incident data.
 *
 * Visible only when 'crowdDensity' overlay is active.
 * Colors interpolate via crowdDensityColor() utility.
 */

import { m } from 'framer-motion';
import { crowdDensityColor } from '@/utils/digitalTwin';
import { StadiumZoneConfig } from '@/types/digitalTwin';

interface CrowdDensityLayerProps {
  zones: StadiumZoneConfig[];
  zoneCrowdDensity: Record<string, number>;
  isVisible: boolean;
}

// Zones that display crowd density overlays
const DENSITY_ZONE_IDS = new Set([
  'north-stand', 'south-stand', 'east-stand', 'west-stand',
  'vip', 'hospitality', 'media',
  'gate-a', 'gate-b', 'gate-c', 'gate-d', 'gate-e', 'gate-f',
  'bus-hub', 'metro', 'taxi',
]);

export function CrowdDensityLayer({
  zones,
  zoneCrowdDensity,
  isVisible,
}: CrowdDensityLayerProps) {
  if (!isVisible) return null;

  const densityZones = zones.filter((z) => DENSITY_ZONE_IDS.has(z.id));

  return (
    <m.g
      aria-label="Crowd density heat overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {densityZones.map((zone) => {
        const density = zoneCrowdDensity[zone.id] ?? 30;
        const color = crowdDensityColor(density);
        // Opacity increases non-linearly with density for clearer visual signal
        const opacity = 0.08 + (density / 100) * 0.38;

        return (
          <m.path
            key={`density-${zone.id}`}
            d={zone.svgPath}
            fill={color}
            stroke="none"
            opacity={opacity}
            pointerEvents="none"
            animate={{ fill: color, opacity }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        );
      })}

      {/* Concourse pressure zones (around the inner track) */}
      <ConcourseHeatZone zoneCrowdDensity={zoneCrowdDensity} />
    </m.g>
  );
}

/**
 * Renders crowd pressure halos around stadium access corridors
 * (the concourse ring between the inner track and seating stands).
 */
function ConcourseHeatZone({
  zoneCrowdDensity,
}: {
  zoneCrowdDensity: Record<string, number>;
}) {
  // Average density across all seating zones for concourse pressure
  const seatingDensities = [
    zoneCrowdDensity['north-stand'],
    zoneCrowdDensity['south-stand'],
    zoneCrowdDensity['east-stand'],
    zoneCrowdDensity['west-stand'],
  ].filter(Boolean) as number[];

  const avgDensity = seatingDensities.length
    ? seatingDensities.reduce((a, b) => a + b, 0) / seatingDensities.length
    : 30;

  const color = crowdDensityColor(avgDensity);
  const opacity = 0.04 + (avgDensity / 100) * 0.12;

  return (
    <m.ellipse
      cx={400}
      cy={308}
      rx={310}
      ry={243}
      fill={color}
      stroke="none"
      opacity={opacity}
      pointerEvents="none"
      animate={{ opacity }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
    />
  );
}
