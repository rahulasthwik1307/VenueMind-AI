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
        stroke="rgba(255,255,255,0.7)"
        strokeWidth={1.2}
        rx={2}
      />

      {/* Center line */}
      <line
        x1={CX}
        y1={PITCH.y}
        x2={CX}
        y2={PITCH.y + PITCH.h}
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={1}
      />

      {/* Center circle */}
      <circle
        cx={CX}
        cy={CY}
        r={CENTER_R}
        fill="none"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={1}
      />

      {/* Center spot */}
      <circle cx={CX} cy={CY} r={2} fill="rgba(255,255,255,0.8)" />

      {/* North penalty area */}
      <rect
        x={CX - PENALTY_W / 2}
        y={PITCH.y}
        width={PENALTY_W}
        height={PENALTY_H / 2}
        fill="none"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={1}
      />

      {/* North goal area */}
      <rect
        x={CX - GOAL_W / 2}
        y={PITCH.y}
        width={GOAL_W}
        height={GOAL_H / 2}
        fill="none"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={1}
      />

      {/* North penalty spot */}
      <circle
        cx={CX}
        cy={PITCH.y + 24}
        r={1.5}
        fill="rgba(255,255,255,0.7)"
      />

      {/* South penalty area */}
      <rect
        x={CX - PENALTY_W / 2}
        y={PITCH.y + PITCH.h - PENALTY_H / 2}
        width={PENALTY_W}
        height={PENALTY_H / 2}
        fill="none"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={1}
      />

      {/* South goal area */}
      <rect
        x={CX - GOAL_W / 2}
        y={PITCH.y + PITCH.h - GOAL_H / 2}
        width={GOAL_W}
        height={GOAL_H / 2}
        fill="none"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={1}
      />

      {/* South penalty spot */}
      <circle
        cx={CX}
        cy={PITCH.y + PITCH.h - 24}
        r={1.5}
        fill="rgba(255,255,255,0.7)"
      />

      {/* Pitch label */}
      <text
        x={CX}
        y={CY + 46}
        textAnchor="middle"
        fontSize={7}
        fontWeight={600}
        fill="rgba(255,255,255,0.35)"
        fontFamily="var(--font-mono, monospace)"
        letterSpacing={2}
      >
        AL BAYT STADIUM
      </text>
    </g>
  );
}
