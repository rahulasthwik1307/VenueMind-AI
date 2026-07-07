'use client';

/**
 * StadiumCanvas — Zoom/Pan Wrapper for Stadium Digital Twin
 *
 * Wraps react-zoom-pan-pinch around StadiumSVG.
 * Handles programmatic camera focus when a zone is selected.
 * Exposes zoom controls to the toolbar via callbacks.
 */

import { useRef, useEffect, useCallback } from 'react';
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

      {/* Scale indicator */}
      <div
        className="absolute bottom-3 right-3 text-xs font-mono text-gray-400 bg-white/60 backdrop-blur-sm px-2 py-1 rounded border border-gray-200"
        aria-hidden="true"
      >
        Scroll to zoom · Drag to pan
      </div>
    </div>
  );
}
