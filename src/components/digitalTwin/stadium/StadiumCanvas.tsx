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
import { mapIncidentLocationToZoneId, ZONE_OFFSETS } from '@/utils/digitalTwin';

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
  const [zoomLevel, setZoomLevel] = useState(1);

  // ── Programmatic camera focus when selectedZone/activeIncident changes ───────────────────
  const prevZoneId = useRef<string | null>(null);
  const prevActiveIncidentId = useRef<string | null>(null);

  useEffect(() => {
    const isIncidentChanged = activeIncidentId !== prevActiveIncidentId.current;
    const isZoneChanged = selectedZoneId !== prevZoneId.current;
    
    if (!isIncidentChanged && !isZoneChanged) return;
    
    prevZoneId.current = selectedZoneId;
    prevActiveIncidentId.current = activeIncidentId;

    if (!transformRef.current || !containerRef.current) return;

    let targetX = 0;
    let targetY = 0;
    let scale = 1;
    let shouldFocus = false;

    if (activeIncidentId) {
      const incident = incidents.find((i) => i.id === activeIncidentId);
      if (incident) {
        const zoneId = mapIncidentLocationToZoneId(incident.location.zone);
        const zone = zoneId ? zones.find((z) => z.id === zoneId) : null;
        if (zone) {
          shouldFocus = true;
          // Calculate offset position for marker to center camera precisely on it
          const activeIncidents = incidents.filter((i) => i.status !== 'resolved');
          const zoneMarkerIndex: Record<string, number> = {};
          targetX = zone.focusPoint.x;
          targetY = zone.focusPoint.y;

          for (const activeInc of activeIncidents) {
            const zId = mapIncidentLocationToZoneId(activeInc.location.zone);
            if (zId) {
              const count = zoneMarkerIndex[zId] ?? 0;
              zoneMarkerIndex[zId] = count + 1;
              if (activeInc.id === activeIncidentId) {
                const offsets = ZONE_OFFSETS[zId] ?? [{ dx: 0, dy: 0 }];
                const offset = offsets[count % offsets.length];
                targetX = zone.focusPoint.x + (offset?.dx ?? 0);
                targetY = zone.focusPoint.y + (offset?.dy ?? 0);
                break;
              }
            }
          }
          // Zoom in closely on the marker
          scale = Math.max(zone.focusPoint.zoom, 2.2);
        }
      }
    } else if (selectedZoneId) {
      const zone = zones.find((z) => z.id === selectedZoneId);
      if (zone) {
        shouldFocus = true;
        targetX = zone.focusPoint.x;
        targetY = zone.focusPoint.y;
        scale = zone.focusPoint.zoom;
      }
    }

    if (shouldFocus) {
      const { offsetWidth: cw, offsetHeight: ch } = containerRef.current;
      const svgW = 800;
      const svgH = 620;
      const containerScale = Math.min(cw / svgW, ch / svgH);
      const scaledX = targetX * containerScale;
      const scaledY = targetY * containerScale;

      const newX = cw / 2 - scaledX * scale;
      const newY = ch / 2 - scaledY * scale;

      transformRef.current.setTransform(newX, newY, scale, 500, 'easeInOutQuad');
    }
  }, [selectedZoneId, activeIncidentId, zones, incidents]);

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

    setZoomLevel(scale);

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
      style={{ background: 'linear-gradient(135deg, var(--background) 0%, var(--surface-1) 100%)' }}
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
              zoomLevel={zoomLevel}
            />
          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* ── Mini Map Overview Overlay ───────────────────────────────────────── */}
      <div 
        className="absolute bottom-3 left-3 w-32 h-[99px] bg-(--surface-1)/80 backdrop-blur border border-(--border) rounded-md overflow-hidden shadow-md select-none cursor-pointer group z-20"
        onClick={handleReset}
        title="Click to reset stadium view"
      >
        <svg viewBox="0 0 800 620" className="w-full h-full opacity-40">
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
          <span className="text-[8px] font-bold font-mono text-(--primary) bg-(--surface-1) px-1 py-0.5 rounded shadow border border-(--border)">
            RESET VIEW
          </span>
        </div>
      </div>

      {/* ── Operational Legend ────────────────────────────────────────────────── */}
      <div 
        className="absolute bottom-12 right-3 p-2.5 bg-(--surface-1)/90 backdrop-blur border border-(--border) rounded-md shadow-lg select-none pointer-events-auto z-20 flex flex-col gap-1.5 max-w-[130px]"
        role="region"
        aria-label="Map Legend"
      >
        <span className="text-[8px] font-bold font-mono text-(--foreground-subtle) uppercase tracking-wider border-b border-(--border) pb-0.5">
          Blueprint Legend
        </span>
        
        {/* Colors (Severity) */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[7px] font-mono text-(--foreground-subtle) uppercase">Severity</span>
          <div className="grid grid-cols-2 gap-x-1 gap-y-0.5">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span className="text-[7.5px] text-(--foreground-muted) font-mono leading-none">Crit</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[7.5px] text-(--foreground-muted) font-mono leading-none">Elev</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[7.5px] text-(--foreground-muted) font-mono leading-none">Norm</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[7.5px] text-(--foreground-muted) font-mono leading-none">Info</span>
            </div>
          </div>
        </div>

        {/* Shapes (Category) */}
        <div className="flex flex-col gap-0.5 pt-1 border-t border-(--border)">
          <span className="text-[7px] font-mono text-(--foreground-subtle) uppercase">Shapes</span>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <svg className="w-2 h-2 text-gray-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5l-9-3z" />
              </svg>
              <span className="text-[7.5px] text-(--foreground-muted) font-mono leading-none">Security</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-2 h-2 text-gray-400 fill-current" viewBox="0 0 24 24">
                <path d="M19 10.5h-5.5V5h-3v5.5H5v3h5.5V19h3v-5.5H19v-3z" />
              </svg>
              <span className="text-[7.5px] text-(--foreground-muted) font-mono leading-none">Medical</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-2 h-2 text-gray-400 fill-current" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span className="text-[7.5px] text-(--foreground-muted) font-mono leading-none">Volunteer</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-2 h-2 text-gray-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2L2 12l10 10 10-10L12 2z" />
              </svg>
              <span className="text-[7.5px] text-(--foreground-muted) font-mono leading-none">Transport</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scale/Pan HUD instructions */}
      <div
        className="absolute bottom-3 right-3 text-[9px] font-mono text-(--foreground-subtle) bg-(--surface-1)/60 backdrop-blur-sm px-2 py-1 rounded border border-(--border)"
        aria-hidden="true"
      >
        Scroll to zoom · Drag to pan
      </div>
    </div>
  );
}
