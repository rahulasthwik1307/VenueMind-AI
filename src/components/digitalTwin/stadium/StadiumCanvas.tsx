'use client';

/**
 * StadiumCanvas — Zoom/Pan Wrapper for Stadium Digital Twin
 *
 * Wraps react-zoom-pan-pinch around StadiumSVG.
 * Handles programmatic camera focus when a zone is selected.
 * Exposes zoom controls to the toolbar via callbacks.
 * Integrates a dynamic, interactive Mini Map viewport locator.
 */

import { useRef, useEffect, useCallback, useState } from 'react';
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchRef,
} from 'react-zoom-pan-pinch';
import { StadiumSVG } from './StadiumSVG';
import { StadiumZoneConfig, OperationalRoute, ZoneStatus } from '@/types/digitalTwin';
import type { Incident } from '@/types/incident';

interface StadiumCanvasProps {
  zones: StadiumZoneConfig[];
  incidents: Incident[];
  activeIncidentId: string | null;
  selectedZoneId: string | null;
  hoveredZoneId: string | null;
  zoneCrowdDensity: Record<string, number>;
  zoneStatuses: Record<string, ZoneStatus>;
  activeRoutes: OperationalRoute[];
  overlays: {
    crowdDensity: boolean;
    incidents: boolean;
    routes: boolean;
    cameras: boolean;
    weather: boolean;
    transport: boolean;
    parking: boolean;
    network: boolean;
  };
  onZoneClick: (zoneId: string) => void;
  onZoneHover: (zoneId: string | null) => void;
  onIncidentClick: (incidentId: string) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onReset?: () => void;
  /** External ref for toolbar to trigger zoom actions */
  controlsRef?: React.MutableRefObject<{
    zoomIn: () => void;
    zoomOut: () => void;
    reset: () => void;
  } | null>;
}

export function StadiumCanvas({
  zones,
  incidents,
  activeIncidentId,
  selectedZoneId,
  hoveredZoneId,
  zoneCrowdDensity,
  zoneStatuses,
  activeRoutes,
  overlays,
  onZoneClick,
  onZoneHover,
  onIncidentClick,
  controlsRef,
}: StadiumCanvasProps) {
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport rectangle coordinates in 800x620 SVG space
  const [viewportRect, setViewportRect] = useState({ x: 0, y: 0, w: 800, h: 620 });

  // ── Programmatic camera focus when selectedZone changes ───────────────────
  const prevZoneId = useRef<string | null>(null);

  useEffect(() => {
    if (selectedZoneId === prevZoneId.current) return;
    prevZoneId.current = selectedZoneId;

    if (!selectedZoneId) return;
    const zone = zones.find((z) => z.id === selectedZoneId);
    if (!zone || !transformRef.current || !containerRef.current) return;

    const { offsetWidth: cw, offsetHeight: ch } = containerRef.current;
    const scale = zone.focusPoint.zoom;

    // Compute translation to center the focus point in the container
    // SVG viewBox is 800x620, so we need to scale SVG coords to container coords
    const svgW = 800;
    const svgH = 620;
    const containerScale = Math.min(cw / svgW, ch / svgH);
    const scaledX = zone.focusPoint.x * containerScale;
    const scaledY = zone.focusPoint.y * containerScale;

    const newX = cw / 2 - scaledX * scale;
    const newY = ch / 2 - scaledY * scale;

    transformRef.current.setTransform(newX, newY, scale, 600, 'easeInOutQuad');
  }, [selectedZoneId, zones]);

  // ── Expose controls to toolbar via ref ───────────────────────────────────
  const handleZoomIn = useCallback(() => {
    transformRef.current?.zoomIn(0.5, 300);
  }, []);

  const handleZoomOut = useCallback(() => {
    transformRef.current?.zoomOut(0.5, 300);
  }, []);

  const handleReset = useCallback(() => {
    transformRef.current?.resetTransform(400, 'easeInOutQuad');
  }, []);

  useEffect(() => {
    if (controlsRef) {
      controlsRef.current = {
        zoomIn: handleZoomIn,
        zoomOut: handleZoomOut,
        reset: handleReset,
      };
    }
  }, [controlsRef, handleZoomIn, handleZoomOut, handleReset]);

  // ── Recalculate viewport box on zoom/pan ─────────────────────────────────
  const handleTransform = useCallback((ref: ReactZoomPanPinchRef) => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth;
    const ch = containerRef.current.clientHeight;
    const scale = ref.state.scale;
    const tx = ref.state.positionX;
    const ty = ref.state.positionY;

    const svgW = 800;
    const svgH = 620;
    const containerScale = Math.min(cw / svgW, ch / svgH);
    const totalScale = containerScale * scale;

    if (totalScale <= 0) return;

    const x = -tx / totalScale;
    const y = -ty / totalScale;
    const w = cw / totalScale;
    const h = ch / totalScale;

    setViewportRect({ x, y, w, h });
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f0f4f2 0%, #e8ede9 100%)' }}
    >
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={0.4}
        maxScale={5}
        limitToBounds={false}
        centerOnInit
        wheel={{ step: 0.08 }}
        doubleClick={{ disabled: false, step: 0.7 }}
        panning={{ velocityDisabled: false }}
        onTransform={handleTransform}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: '100%', height: '100%' }}
        >
          <div style={{ width: '800px', height: '620px' }}>
            <StadiumSVG
              zones={zones}
              incidents={incidents}
              activeIncidentId={activeIncidentId}
              selectedZoneId={selectedZoneId}
              hoveredZoneId={hoveredZoneId}
              zoneCrowdDensity={zoneCrowdDensity}
              zoneStatuses={zoneStatuses}
              activeRoutes={activeRoutes}
              overlays={overlays}
              onZoneClick={onZoneClick}
              onZoneHover={onZoneHover}
              onIncidentClick={onIncidentClick}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* ── Mini Map Overview Overlay ───────────────────────────────────────── */}
      <div 
        className="absolute bottom-3 left-3 w-32 h-[99px] bg-white/70 dark:bg-gray-950/70 backdrop-blur border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden shadow-md select-none cursor-pointer group z-20"
        onClick={handleReset}
        title="Click to reset stadium view"
      >
        <svg viewBox="0 0 800 620" className="w-full h-full opacity-60 dark:opacity-40">
          {/* Outer perimeter outline */}
          <ellipse
            cx={400}
            cy={308}
            rx={310}
            ry={243}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={3}
          />
          {/* Pitch wireframe */}
          <rect
            x={282}
            y={230}
            width={236}
            height={152}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={2}
          />
        </svg>

        {/* Viewport tracking frame */}
        <div 
          className="absolute border border-(--primary) bg-(--primary-muted)/10 pointer-events-none transition-all duration-75"
          style={{
            left: `${(Math.max(0, viewportRect.x) / 800) * 100}%`,
            top: `${(Math.max(0, viewportRect.y) / 620) * 100}%`,
            width: `${(Math.min(800, viewportRect.w) / 800) * 100}%`,
            height: `${(Math.min(620, viewportRect.h) / 620) * 100}%`,
          }}
        />

        {/* North compass indicator */}
        <div className="absolute top-1 left-1.5 flex items-center pointer-events-none select-none">
          <span className="text-[7px] font-bold font-mono text-(--primary) tracking-wide">▲ N</span>
        </div>

        {/* Click to Reset Prompt Overlay */}
        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
          <span className="text-[8px] font-bold font-mono text-(--primary) bg-white dark:bg-gray-900 px-1 py-0.5 rounded shadow border border-gray-100 dark:border-gray-800">
            RESET VIEW
          </span>
        </div>
      </div>

      {/* Scale/Pan HUD instructions */}
      <div
        className="absolute bottom-3 right-3 text-[9px] font-mono text-gray-400 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm px-2 py-1 rounded border border-gray-200 dark:border-gray-800"
        aria-hidden="true"
      >
        Scroll to zoom · Drag to pan
      </div>
    </div>
  );
}
