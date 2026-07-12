'use client';

/**
 * PitchLayer — Football Pitch SVG
 *
 * Renders the football pitch with accurate proportions and markings.
 * ViewBox reference: 0 0 800 620, pitch: x=282 y=230 w=236 h=152.
 * Pure presentation — no state.
 */

const PITCH = { x: 282, y: 230, w: 236, h: 152 };
const CX = PITCH.x + PITCH.w / 2;
const CY = PITCH.y + PITCH.h / 2;

// Relative positions inside pitch (re-scaled to match 105m x 68m realistic ratio)
const PENALTY_W = 90;
const PENALTY_H = 74; // so PENALTY_H / 2 = 37
const GOAL_W = 41;
const GOAL_H = 24; // so GOAL_H / 2 = 12
const CENTER_R = 21;

export function PitchLayer() {
  return (
    <g aria-label="Football pitch" role="img">
      {/* Pitch fill */}
      <rect
        x={PITCH.x}
        y={PITCH.y}
        width={PITCH.w}
        height={PITCH.h}
        fill="#3d7a4a"
        rx={2}
      />

      {/* Alternating grass stripes (subtle horizontal mow-stripes running the length) */}
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x={PITCH.x}
          y={PITCH.y + (i * PITCH.h) / 12}
          width={PITCH.w}
          height={PITCH.h / 12}
          fill={i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'transparent'}
          pointerEvents="none"
        />
      ))}

      {/* Secondary technical/touchline boundary outline just outside the main pitch rect */}
      <rect
        x={PITCH.x - 6}
        y={PITCH.y - 6}
        width={PITCH.w + 12}
        height={PITCH.h + 12}
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={0.8}
        strokeDasharray="2 3"
        rx={3}
        pointerEvents="none"
      />

      {/* Pitch outline */}
      <rect
        x={PITCH.x}
        y={PITCH.y}
        width={PITCH.w}
        height={PITCH.h}
        fill="none"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={1.8}
        rx={2}
      />

      {/* Center line */}
      <line
        x1={CX}
        y1={PITCH.y}
        x2={CX}
        y2={PITCH.y + PITCH.h}
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={1.8}
      />

      {/* Center circle */}
      <circle
        cx={CX}
        cy={CY}
        r={CENTER_R}
        fill="none"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={1.8}
      />

      {/* Center spot */}
      <circle cx={CX} cy={CY} r={2.5} fill="rgba(255,255,255,0.95)" />

      {/* North penalty area */}
      <rect
        x={CX - PENALTY_W / 2}
        y={PITCH.y}
        width={PENALTY_W}
        height={PENALTY_H / 2}
        fill="none"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={1.8}
      />

      {/* North goal area */}
      <rect
        x={CX - GOAL_W / 2}
        y={PITCH.y}
        width={GOAL_W}
        height={GOAL_H / 2}
        fill="none"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={1.8}
      />

      {/* North penalty spot */}
      <circle
        cx={CX}
        cy={PITCH.y + 24.6}
        r={1.8}
        fill="rgba(255,255,255,0.95)"
      />

      {/* South penalty area */}
      <rect
        x={CX - PENALTY_W / 2}
        y={PITCH.y + PITCH.h - PENALTY_H / 2}
        width={PENALTY_W}
        height={PENALTY_H / 2}
        fill="none"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={1.8}
      />

      {/* South goal area */}
      <rect
        x={CX - GOAL_W / 2}
        y={PITCH.y + PITCH.h - GOAL_H / 2}
        width={GOAL_W}
        height={GOAL_H / 2}
        fill="none"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={1.8}
      />

      {/* South penalty spot */}
      <circle
        cx={CX}
        cy={PITCH.y + PITCH.h - 24.6}
        r={1.8}
        fill="rgba(255,255,255,0.95)"
      />

      {/* Corner arcs (quarter circles at four corners) */}
      <path
        d={`M ${PITCH.x + 5} ${PITCH.y} A 5 5 0 0 1 ${PITCH.x} ${PITCH.y + 5}`}
        fill="none"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={1.8}
        pointerEvents="none"
      />
      <path
        d={`M ${PITCH.x + PITCH.w} ${PITCH.y + 5} A 5 5 0 0 1 ${PITCH.x + PITCH.w - 5} ${PITCH.y}`}
        fill="none"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={1.8}
        pointerEvents="none"
      />
      <path
        d={`M ${PITCH.x} ${PITCH.y + PITCH.h - 5} A 5 5 0 0 1 ${PITCH.x + 5} ${PITCH.y + PITCH.h}`}
        fill="none"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={1.8}
        pointerEvents="none"
      />
      <path
        d={`M ${PITCH.x + PITCH.w - 5} ${PITCH.y + PITCH.h} A 5 5 0 0 1 ${PITCH.x + PITCH.w} ${PITCH.y + PITCH.h - 5}`}
        fill="none"
        stroke="rgba(255,255,255,0.95)"
        strokeWidth={1.8}
        pointerEvents="none"
      />

      {/* Relocated Pitch label (above playing surface) */}
      <text
        x={CX}
        y={212}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={8.5}
        fontWeight={750}
        fill="var(--foreground-muted)"
        opacity={0.5}
        fontFamily="var(--font-mono, monospace)"
        letterSpacing={2.5}
      >
        AL BAYT STADIUM
      </text>
    </g>
  );
}
