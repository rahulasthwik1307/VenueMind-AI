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

// Relative positions inside pitch
const PENALTY_W = 44;
const PENALTY_H = 80;
const GOAL_W = 12;
const GOAL_H = 36;
const CENTER_R = 28;

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

      {/* Alternating grass stripes (subtle) */}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x={PITCH.x + (i * PITCH.w) / 8}
          y={PITCH.y}
          width={PITCH.w / 8}
          height={PITCH.h}
          fill={i % 2 === 0 ? 'rgba(0,0,0,0.035)' : 'transparent'}
        />
      ))}

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
        cy={PITCH.y + 24}
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
        cy={PITCH.y + PITCH.h - 24}
        r={1.8}
        fill="rgba(255,255,255,0.95)"
      />

      {/* Relocated Pitch label (above playing surface) */}
      <text
        x={CX}
        y={212}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={8.5}
        fontWeight={750}
        fill="rgba(255,255,255,0.85)"
        fontFamily="var(--font-mono, monospace)"
        letterSpacing={2.5}
      >
        AL BAYT STADIUM
      </text>
    </g>
  );
}
