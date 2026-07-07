'use client';

/**
 * RouteLayer — Animated Operational Dispatch Routes
 *
 * Renders animated SVG paths for operational dispatches.
 * Supports: Medical, Security, Volunteer, VIP, Transport, Evacuation.
 *
 * Each route draws progressively using Framer Motion pathLength.
 * Visible only when 'routes' overlay is active.
 */

import { m, AnimatePresence } from 'framer-motion';
import { OperationalRoute, RouteType } from '@/types/digitalTwin';
import { ROUTE_COLORS } from '@/utils/digitalTwin';

interface RouteLayerProps {
  routes: OperationalRoute[];
  isVisible: boolean;
}

const ROUTE_DASH_PATTERNS: Record<RouteType, string> = {
  medical: '6 3',
  security: '8 2',
  volunteer: '5 4',
  vip: '4 2',
  transport: '10 4',
  evacuation: '3 2',
};

const ROUTE_STROKE_WIDTH: Record<RouteType, number> = {
  medical: 2.5,
  security: 2,
  volunteer: 2,
  vip: 2,
  transport: 2.5,
  evacuation: 3,
};

const ROUTE_TYPE_LABELS: Record<RouteType, string> = {
  medical: 'Medical',
  security: 'Security',
  volunteer: 'Volunteer',
  vip: 'VIP',
  transport: 'Transport',
  evacuation: 'EVAC',
};

export function RouteLayer({ routes, isVisible }: RouteLayerProps) {
  if (!isVisible) return null;

  return (
    <g aria-label="Operational routes">
      <AnimatePresence>
        {routes
          .filter((r) => r.isActive)
          .map((route) => {
            const color = ROUTE_COLORS[route.type];
            const dashPattern = ROUTE_DASH_PATTERNS[route.type];
            const strokeWidth = ROUTE_STROKE_WIDTH[route.type];

            return (
              <g key={route.id}>
                {/* Route glow (background) */}
                <m.path
                  d={route.pathData}
                  stroke={color}
                  strokeWidth={strokeWidth + 4}
                  fill="none"
                  opacity={0}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.12 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.8, ease: 'easeInOut' }}
                />

                {/* Primary route path */}
                <m.path
                  d={route.pathData}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={dashPattern}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.9 }}
                  exit={{ pathLength: 0, opacity: 0 }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                />

                {/* Moving dot along route (animated scout position) */}
                <RouteMovingDot route={route} color={color} />

                {/* Route type label at midpoint */}
                <RouteLabel route={route} color={color} label={ROUTE_TYPE_LABELS[route.type]} />
              </g>
            );
          })}
      </AnimatePresence>
    </g>
  );
}

interface RouteDotProps {
  route: OperationalRoute;
  color: string;
}

function RouteMovingDot({ route, color }: RouteDotProps) {
  // Parse start and end of the path for approximate midpoint animation
  // This is a simplified representation using offsetDistance would require
  // a real SVG motion path which Framer Motion supports via 'offsetPath'
  return (
    <m.circle
      r={3.5}
      fill={color}
      stroke="#ffffff"
      strokeWidth={1.5}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{
        duration: 2,
        delay: 1.4,
        times: [0, 0.1, 0.85, 1],
        ease: 'easeInOut',
      }}
      style={{
        offsetPath: `path("${route.pathData}")`,
        offsetDistance: '100%',
      }}
    />
  );
}

interface RouteLabelProps {
  route: OperationalRoute;
  color: string;
  label: string;
}

function RouteLabel({ route, color, label }: RouteLabelProps) {
  // Parse approximate midpoint from path (simplified cubic bezier midpoint)
  const pathParts = route.pathData.match(/[\d.]+/g);
  if (!pathParts || pathParts.length < 4) return null;

  const nums = pathParts.map(Number);
  // Q bezier: M x0 y0 Q cx cy x1 y1 → midpoint ≈ control point
  const labelX = nums[4] ?? ((nums[0] + nums[nums.length - 2]) / 2);
  const labelY = nums[5] ?? ((nums[1] + nums[nums.length - 1]) / 2);

  return (
    <m.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 1.0, duration: 0.3 }}
    >
      <rect
        x={labelX - 16}
        y={labelY - 8}
        width={32}
        height={14}
        rx={3}
        fill={color}
        opacity={0.9}
      />
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={6.5}
        fontWeight={700}
        fill="#ffffff"
        fontFamily="var(--font-mono, monospace)"
        letterSpacing={0.5}
        pointerEvents="none"
      >
        {label}
      </text>
    </m.g>
  );
}
