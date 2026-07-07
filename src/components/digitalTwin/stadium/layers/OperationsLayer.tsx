'use client';

/**
 * OperationsLayer — Stadium Operations Zones Refinement
 *
 * Renders Command Center, Security HQ, Medical HQ, Volunteer HQ,
 * and CCTV Hub as standardized operational node geometries in the design system.
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

export function OperationsLayer({
  zones,
  selectedZoneId,
  hoveredZoneId,
  onZoneClick,
  onZoneHover,
}: OperationsLayerProps) {
  const opsZones = zones.filter((z) => OPS_ZONE_IDS.has(z.id));

  // Render the standardized shape for each node
  const renderNodeShape = (zoneId: string, cx: number, cy: number, isSelected: boolean) => {
    const activeClass = isSelected ? "filter drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]" : "";

    switch (zoneId) {
      case 'command-center': {
        // Hexagonal operations hub node
        return (
          <g className={activeClass}>
            <polygon
              points={`${cx-14},${cy} ${cx-7},${cy-10} ${cx+7},${cy-10} ${cx+14},${cy} ${cx+7},${cy+10} ${cx-7},${cy+10}`}
              fill="var(--primary)"
              stroke="#ffffff"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={6}
              fontWeight={800}
              fill="#ffffff"
              fontFamily="var(--font-mono, monospace)"
            >
              CMD
            </text>
          </g>
        );
      }
      case 'security-hq': {
        // Shield node for security
        return (
          <g className={activeClass}>
            <path
              d={`M ${cx},${cy-10} L ${cx+9},${cy-10} A 13,13 0 0 1 ${cx+9},${cy+1} C ${cx+9},${cy+8} ${cx},${cy+12} ${cx},${cy+12} C ${cx},${cy+12} ${cx-9},${cy+8} ${cx-9},${cy+1} A 13,13 0 0 1 ${cx-9},${cy-10} Z`}
              fill="#1e40af"
              stroke="#ffffff"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy-0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={6}
              fontWeight={800}
              fill="#ffffff"
              fontFamily="var(--font-mono, monospace)"
            >
              SEC
            </text>
          </g>
        );
      }
      case 'medical-hq': {
        // Rounded card/pill node for medical
        return (
          <g className={activeClass}>
            <rect
              x={cx-14}
              y={cy-9}
              width={28}
              height={18}
              rx={4}
              fill="#dc2626"
              stroke="#ffffff"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={8}
              fontWeight={800}
              fill="#ffffff"
              fontFamily="var(--font-mono, monospace)"
            >
              ✚
            </text>
          </g>
        );
      }
      case 'volunteer-hq': {
        // Circular purple node for volunteer
        return (
          <g className={activeClass}>
            <circle
              cx={cx}
              cy={cy}
              r={10}
              fill="#7c3aed"
              stroke="#ffffff"
              strokeWidth={1.5}
            />
            <text
              x={cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={6.5}
              fontWeight={800}
              fill="#ffffff"
              fontFamily="var(--font-mono, monospace)"
            >
              VOL
            </text>
          </g>
        );
      }
      case 'cctv-hub': {
        // Camera node for CCTV Hub
        return (
          <g className={activeClass}>
            <rect
              x={cx-13}
              y={cy-9}
              width={26}
              height={18}
              rx={3}
              fill="#4b5563"
              stroke="#ffffff"
              strokeWidth={1.5}
            />
            {/* Tiny camera SVG detail */}
            <path
              d={`M ${cx-5},${cy+2} L ${cx-3},${cy+2} L ${cx-2.5},${cy-0.5} L ${cx+2.5},${cy-0.5} L ${cx+3},${cy+2} L ${cx+5},${cy+2} L ${cx+5},${cy-5} L ${cx-5},${cy-5} Z`}
              fill="#ffffff"
            />
            <circle cx={cx} cy={cy-1.5} r={1.8} fill="#4b5563" />
            <text
              x={cx}
              y={cy+5}
              textAnchor="middle"
              fontSize={4.5}
              fontWeight={800}
              fill="#ffffff"
              fontFamily="var(--font-mono, monospace)"
            >
              CCTV
            </text>
          </g>
        );
      }
      default:
        return null;
    }
  };

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
            {/* Zone boundary path (translucent in backend, highlighted when hovered/selected) */}
            <path
              d={zone.svgPath}
              fill={isSelected ? "var(--border-strong)" : isHovered ? "var(--border)" : "transparent"}
              stroke={isSelected ? zone.defaultColor : isHovered ? `${zone.defaultColor}cc` : `${zone.defaultColor}44`}
              strokeWidth={isSelected ? 1.5 : 1}
              strokeDasharray={isSelected ? "none" : "3 3"}
            />

            {/* Standardized Node Icon */}
            {renderNodeShape(zone.id, zone.labelPosition.x, zone.labelPosition.y, isSelected)}

            {/* Hover tooltip name */}
            {isHovered && (
              <g pointerEvents="none">
                <rect
                  x={zone.labelPosition.x - 30}
                  y={zone.labelPosition.y - 24}
                  width={60}
                  height={11}
                  fill="var(--surface-3)"
                  rx={2}
                  opacity={0.88}
                />
                <text
                  x={zone.labelPosition.x}
                  y={zone.labelPosition.y - 18}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={5.5}
                  fontWeight={600}
                  fill="var(--foreground)"
                >
                  {zone.name}
                </text>
              </g>
            )}
          </m.g>
        );
      })}
    </g>
  );
}
