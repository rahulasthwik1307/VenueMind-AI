'use client';

/**
 * StructuralDetailLayer — Detailed schematic blueprints
 *
 * Renders:
 * - VIP corridors (gold dashed lines)
 * - Service access tunnels (double lines at corners)
 * - Emergency exit indicators (green schematic cards)
 * - CCTV Camera positions + FOV cones (toggled via cameras overlay)
 * - Animated Operational Network (toggled via network overlay)
 */

import { m, AnimatePresence } from 'framer-motion';

interface StructuralDetailLayerProps {
  camerasOverlayActive: boolean;
  networkOverlayActive: boolean;
}

// Camera nodes definitions
interface CameraData {
  id: string;
  cx: number;
  cy: number;
  rot: number; // angle of view
}

const CAMERAS: CameraData[] = [
  { id: 'cam-01', cx: 400, cy: 95, rot: 90 },    // North Gate/Concourse
  { id: 'cam-02', cx: 720, cy: 308, rot: 180 }, // East Stand
  { id: 'cam-03', cx: 400, cy: 520, rot: -90 },  // South Gate/Concourse
  { id: 'cam-04', cx: 80, cy: 308, rot: 0 },    // West Stand
  { id: 'cam-05', cx: 525, cy: 220, rot: 135 },  // East Pitch Corner
  { id: 'cam-06', cx: 275, cy: 395, rot: -45 },  // West Pitch Corner
];

export function StructuralDetailLayer({
  camerasOverlayActive,
  networkOverlayActive,
}: StructuralDetailLayerProps) {
  return (
    <g aria-label="Structural details">
      {/* Natively embed style tag for animated network flow */}
      <style>{`
        @keyframes networkFlow {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animated-network-flow {
          stroke-dasharray: 6 4;
          animation: networkFlow 1.2s linear infinite;
        }
      `}</style>

      {/* ── 1. VIP Corridors ────────────────────────────────────────────────── */}
      {/* Dash line connecting Gate C (SE) and VIP suites */}
      <path
        d="M 616,500 C 650,470 673,380 673,370"
        fill="none"
        stroke="#d97706"
        strokeWidth={1}
        strokeDasharray="2 3"
        opacity={0.6}
        pointerEvents="none"
      />
      <path
        d="M 673,370 C 673,330 680,260 680,248"
        fill="none"
        stroke="#d97706"
        strokeWidth={1}
        strokeDasharray="2 3"
        opacity={0.6}
        pointerEvents="none"
      />

      {/* ── 2. Service Access Tunnels ───────────────────────────────────────── */}
      {/* Northwest Corridor */}
      <g opacity={0.35} pointerEvents="none">
        <line x1={120} y1={120} x2={165} y2={165} stroke="#6b7280" strokeWidth={3} />
        <line x1={125} y1={115} x2={170} y2={160} stroke="#f0f4f2" strokeWidth={1} />
      </g>
      {/* Northeast Corridor */}
      <g opacity={0.35} pointerEvents="none">
        <line x1={680} y1={120} x2={635} y2={165} stroke="#6b7280" strokeWidth={3} />
        <line x1={675} y1={115} x2={630} y2={160} stroke="#f0f4f2" strokeWidth={1} />
      </g>
      {/* Southeast Corridor */}
      <g opacity={0.35} pointerEvents="none">
        <line x1={680} y1={496} x2={635} y2={451} stroke="#6b7280" strokeWidth={3} />
        <line x1={675} y1={501} x2={630} y2={456} stroke="#f0f4f2" strokeWidth={1} />
      </g>
      {/* Southwest Corridor */}
      <g opacity={0.35} pointerEvents="none">
        <line x1={120} y1={496} x2={165} y2={451} stroke="#6b7280" strokeWidth={3} />
        <line x1={125} y1={501} x2={170} y2={456} stroke="#f0f4f2" strokeWidth={1} />
      </g>

      {/* ── 3. Emergency Exits ──────────────────────────────────────────────── */}
      {/* North gate exit */}
      <g transform="translate(400, 20)" opacity={0.8} pointerEvents="none">
        <rect x={-14} y={-5} width={28} height={10} rx={1} fill="#16a34a" stroke="#ffffff" strokeWidth={0.5} />
        <text x={0} y={0} textAnchor="middle" dominantBaseline="middle" fontSize={4} fontWeight={800} fill="#ffffff" fontFamily="var(--font-mono, monospace)">EXIT</text>
      </g>
      {/* South gate exit */}
      <g transform="translate(400, 595)" opacity={0.8} pointerEvents="none">
        <rect x={-14} y={-5} width={28} height={10} rx={1} fill="#16a34a" stroke="#ffffff" strokeWidth={0.5} />
        <text x={0} y={0} textAnchor="middle" dominantBaseline="middle" fontSize={4} fontWeight={800} fill="#ffffff" fontFamily="var(--font-mono, monospace)">EXIT</text>
      </g>

      {/* ── 4. Cameras Overlay (FOV Cones + Nodes) ─────────────────────────── */}
      <AnimatePresence>
        {camerasOverlayActive && (
          <m.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {CAMERAS.map((cam) => {
              const fovAngle = 40; // 40 degrees width
              const r1 = cam.rot - fovAngle / 2;
              const r2 = cam.rot + fovAngle / 2;
              const rad1 = (r1 * Math.PI) / 180;
              const rad2 = (r2 * Math.PI) / 180;

              const len = 35; // length of cone
              const p1x = cam.cx + len * Math.cos(rad1);
              const p1y = cam.cy + len * Math.sin(rad1);
              const p2x = cam.cx + len * Math.cos(rad2);
              const p2y = cam.cy + len * Math.sin(rad2);

              return (
                <g key={cam.id}>
                  {/* Field of View cone */}
                  <path
                    d={`M ${cam.cx},${cam.cy} L ${p1x},${p1y} A ${len},${len} 0 0,1 ${p2x},${p2y} Z`}
                    fill="rgba(139, 92, 246, 0.08)"
                    stroke="rgba(139, 92, 246, 0.15)"
                    strokeWidth={0.5}
                    pointerEvents="none"
                  />

                  {/* Camera Node */}
                  <g transform={`translate(${cam.cx}, ${cam.cy}) rotate(${cam.rot - 90})`}>
                    <rect x={-4} y={-5} width={8} height={10} rx={1.5} fill="#7c3aed" stroke="#ffffff" strokeWidth={1} />
                    <polygon points="0,-7 -2,-5 2,-5" fill="#ffffff" />
                  </g>
                </g>
              );
            })}
          </m.g>
        )}
      </AnimatePresence>

      {/* ── 5. Operational Network Overlay ─────────────────────────────────── */}
      <AnimatePresence>
        {networkOverlayActive && (
          <m.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated Connector Line */}
            {/* Path: Gate D (400, 558) -> Medical HQ (683, 406) -> Security HQ (683, 210) -> Command Center (117, 210) -> Transit Hub/Metro (720, 500) */}
            <path
              d="M 400,558 C 450,558 600,500 683,406 L 683,210 L 117,210 C 117,350 500,450 720,500"
              fill="none"
              stroke="var(--primary)"
              strokeWidth={1.5}
              className="animated-network-flow"
              opacity={0.7}
              pointerEvents="none"
            />

            {/* Hub indicators */}
            <circle cx={400} cy={558} r={3} fill="#0f5132" stroke="#ffffff" strokeWidth={1} />
            <circle cx={683} cy={406} r={3} fill="#0f5132" stroke="#ffffff" strokeWidth={1} />
            <circle cx={683} cy={210} r={3} fill="#0f5132" stroke="#ffffff" strokeWidth={1} />
            <circle cx={117} cy={210} r={3} fill="#0f5132" stroke="#ffffff" strokeWidth={1} />
            <circle cx={720} cy={500} r={3} fill="#0f5132" stroke="#ffffff" strokeWidth={1} />
          </m.g>
        )}
      </AnimatePresence>
    </g>
  );
}
