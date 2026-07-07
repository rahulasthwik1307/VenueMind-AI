'use client';

/**
 * SeatingLayer — Stadium Seating Stands Refinement
 *
 * Upgrades the seating bowl with enterprise-grade operational details:
 * - Concentric Tier 1 and Tier 2 stand division
 * - Radial aisle walkways
 * - Concentric concourse guides
 * - Shaded depth overlays (bowl gradient)
 * - Clean monospaced section markers
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
  normal: 'rgba(15, 81, 50, 0.1)',
  busy: '#e6a800',
  high: '#d97706',
  critical: '#dc2626',
  closed: '#374151',
  evacuating: '#dc2626',
};

// Radial Aisle Angles to subdivide stands
const AISLE_ANGLES = [
  -145, -130, -115, -100, -80, -65, -50, -35, // North Stand
  35, 50, 65, 80, 100, 115, 130, 145,         // South Stand
  -20, -10, 0, 10, 20,                         // East Stand
  160, 170, 180, 190, 200,                     // West Stand
];

// Custom Section labels inside stands
const SECTIONS = [
  // North Stand (Upper / Lower)
  { label: 'SEC 201', ang: -130, rx: 290, ry: 227 },
  { label: 'SEC 202', ang: -90,  rx: 290, ry: 227 },
  { label: 'SEC 203', ang: -50,  rx: 290, ry: 227 },
  { label: 'SEC 101', ang: -130, rx: 258, ry: 198 },
  { label: 'SEC 102', ang: -90,  rx: 258, ry: 198 },
  { label: 'SEC 103', ang: -50,  rx: 258, ry: 198 },

  // South Stand (Upper / Lower)
  { label: 'SEC 204', ang: 50,   rx: 290, ry: 227 },
  { label: 'SEC 205', ang: 90,   rx: 290, ry: 227 },
  { label: 'SEC 206', ang: 130,  rx: 290, ry: 227 },
  { label: 'SEC 104', ang: 50,   rx: 258, ry: 198 },
  { label: 'SEC 105', ang: 90,   rx: 258, ry: 198 },
  { label: 'SEC 106', ang: 130,  rx: 258, ry: 198 },

  // East Stand
  { label: 'SEC 207', ang: -15,  rx: 290, ry: 227 },
  { label: 'SEC 208', ang: 15,   rx: 290, ry: 227 },
  { label: 'SEC 107', ang: -15,  rx: 258, ry: 198 },
  { label: 'SEC 108', ang: 15,   rx: 258, ry: 198 },

  // West Stand
  { label: 'SEC 209', ang: 165,  rx: 290, ry: 227 },
  { label: 'SEC 210', ang: 195,  rx: 290, ry: 227 },
  { label: 'SEC 109', ang: 165,  rx: 258, ry: 198 },
  { label: 'SEC 110', ang: 195,  rx: 258, ry: 198 },
];

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
      <defs>
        {/* Ambient occlusion / 3D bowl depth shading */}
        <radialGradient id="seating-bowl-depth" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#000000" stopOpacity={0} />
          <stop offset="90%" stopColor="#000000" stopOpacity={0.06} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.22} />
        </radialGradient>
      </defs>

      {/* Stand background geometries */}
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
            strokeWidth={isSelected ? 2 : status !== 'normal' ? 1.2 : 0.8}
            opacity={isHovered && !isSelected ? 0.85 : 1}
            style={{ cursor: 'pointer' }}
            onClick={() => onZoneClick(zone.id)}
            onMouseEnter={() => onZoneHover(zone.id)}
            onMouseLeave={() => onZoneHover(null)}
            role="button"
            aria-label={`${zone.name} — click to view stand details`}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onZoneClick(zone.id);
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        );
      })}

      {/* Donut overlay for 3D depth gradient (Outer rx=310 ry=243, Inner rx=242 ry=186) */}
      <path
        d="M 90,308 A 310,243 0 1,1 710,308 A 310,243 0 1,1 90,308 M 158,308 A 242,186 0 1,0 642,308 A 242,186 0 1,0 158,308 Z"
        fill="url(#seating-bowl-depth)"
        pointerEvents="none"
      />

      {/* Concentric Tier Divider Ellipse (Tier 1 vs Tier 2) */}
      <ellipse
        cx={400}
        cy={308}
        rx={276}
        ry={214}
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1}
        pointerEvents="none"
      />

      {/* Concentric Concourse Lane (inside stands for visual corridors) */}
      <ellipse
        cx={400}
        cy={308}
        rx={258}
        ry={198}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={0.8}
        strokeDasharray="4 2"
        pointerEvents="none"
      />

      {/* Radial Aisle Walkways */}
      {AISLE_ANGLES.map((ang) => {
        const rad = (ang * Math.PI) / 180;
        const xInner = 400 + 242 * Math.cos(rad);
        const yInner = 308 + 186 * Math.sin(rad);
        const xOuter = 400 + 310 * Math.cos(rad);
        const yOuter = 308 + 243 * Math.sin(rad);
        return (
          <line
            key={`aisle-${ang}`}
            x1={xInner}
            y1={yInner}
            x2={xOuter}
            y2={yOuter}
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth={1}
            pointerEvents="none"
          />
        );
      })}

      {/* Monospaced Section Labels */}
      {SECTIONS.map((sec) => {
        const rad = (sec.ang * Math.PI) / 180;
        const x = 400 + sec.rx * Math.cos(rad);
        const y = 308 + sec.ry * Math.sin(rad);
        return (
          <text
            key={`sec-lbl-${sec.label}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={4.5}
            fontWeight={600}
            fill="rgba(0,0,0,0.3)"
            className="dark:fill-white/30"
            fontFamily="var(--font-mono, monospace)"
            pointerEvents="none"
            style={{ userSelect: 'none' }}
          >
            {sec.label}
          </text>
        );
      })}

      {/* Base Zone Label text overlays */}
      {seatingZones.map((zone) => {
        const isSelected = selectedZoneId === zone.id;
        return (
          <text
            key={`label-${zone.id}`}
            x={zone.labelPosition.x}
            y={zone.labelPosition.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={zone.type === 'seating' ? 8 : 6.5}
            fontWeight={isSelected ? 700 : 600}
            fill={isSelected ? '#0f5132' : '#374151'}
            className="dark:fill-gray-300"
            fontFamily="var(--font-mono, monospace)"
            letterSpacing={0.5}
            pointerEvents="none"
            style={{ userSelect: 'none' }}
          >
            {zone.shortName.toUpperCase()}
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
        stroke="rgba(120,150,130,0.2)"
        strokeWidth={3}
        pointerEvents="none"
      />
    </g>
  );
}
