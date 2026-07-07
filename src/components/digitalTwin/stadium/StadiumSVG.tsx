'use client';

/**
 * StadiumSVG — Master SVG Compositor
 *
 * Composes all stadium layers in correct Z-order.
 * Pure presentation — receives all data as props, no store access.
 * All interactions are delegated upward via callbacks.
 */

import { StadiumZoneConfig, OperationalRoute, ZoneStatus } from '@/types/digitalTwin';
import type { Incident } from '@/types/incident';
import { PitchLayer } from './layers/PitchLayer';
import { SeatingLayer } from './layers/SeatingLayer';
import { GateLayer } from './layers/GateLayer';
import { OperationsLayer } from './layers/OperationsLayer';
import { ExternalZoneLayer } from './layers/ExternalZoneLayer';
import { CrowdDensityLayer } from './layers/CrowdDensityLayer';
import { IncidentMarkerLayer } from './layers/IncidentMarkerLayer';
import { RouteLayer } from './layers/RouteLayer';
import { SelectionLayer } from './layers/SelectionLayer';
import { ZoneTooltip } from './ZoneTooltip';
import { StructuralDetailLayer } from './layers/StructuralDetailLayer';

interface StadiumSVGProps {
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
  zoomLevel?: number;
}

export function StadiumSVG({
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
  zoomLevel = 1,
}: StadiumSVGProps) {
  return (
    <svg
      viewBox="0 0 800 620"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Stadium Digital Twin — interactive operational map"
      role="application"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* Definitions: filters and markers */}
      <defs>
        <filter id="stadium-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="rgba(0,0,0,0.3)" />
        </filter>
        <filter id="marker-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="stadium-bg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="var(--surface-1)" />
          <stop offset="100%" stopColor="var(--background)" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width={800} height={620} fill="url(#stadium-bg)" />

      {/* Outer stadium footprint */}
      <ellipse
        cx={400}
        cy={308}
        rx={320}
        ry={252}
        fill="var(--surface-2)"
        fillOpacity={0.7}
        stroke="var(--border)"
        strokeWidth={1}
        filter="url(#stadium-shadow)"
      />

      {/* Layer 1: External zones (under everything) */}
      <ExternalZoneLayer
        zones={zones}
        selectedZoneId={selectedZoneId}
        hoveredZoneId={hoveredZoneId}
        zoneCrowdDensity={zoneCrowdDensity}
        transportOverlayActive={overlays.transport}
        onZoneClick={onZoneClick}
        onZoneHover={onZoneHover}
      />

      {/* Layer 2: Seating stands (foundation) */}
      <SeatingLayer
        zones={zones}
        selectedZoneId={selectedZoneId}
        hoveredZoneId={hoveredZoneId}
        onZoneClick={onZoneClick}
        onZoneHover={onZoneHover}
        zoneStatuses={zoneStatuses}
        zoneCrowdDensity={zoneCrowdDensity}
        zoomLevel={zoomLevel}
      />

      {/* Layer 3: Pitch */}
      <PitchLayer />

      {/* Layer 4: Operations zones (inside the outer boundary corners) */}
      <OperationsLayer
        zones={zones}
        selectedZoneId={selectedZoneId}
        hoveredZoneId={hoveredZoneId}
        onZoneClick={onZoneClick}
        onZoneHover={onZoneHover}
      />

      {/* Layer 5: Gates */}
      <GateLayer
        zones={zones}
        selectedZoneId={selectedZoneId}
        hoveredZoneId={hoveredZoneId}
        zoneCrowdDensity={zoneCrowdDensity}
        onZoneClick={onZoneClick}
        onZoneHover={onZoneHover}
      />

      {/* Layer 5.5: Structural Blueprints (VIP, tunnels, camera FOVs, network overlay) */}
      <StructuralDetailLayer
        camerasOverlayActive={overlays.cameras}
        networkOverlayActive={overlays.network}
      />

      {/* Layer 6: Crowd density heat overlay */}
      <CrowdDensityLayer
        zones={zones}
        zoneCrowdDensity={zoneCrowdDensity}
        isVisible={overlays.crowdDensity}
      />

      {/* Layer 7: Operational routes */}
      <RouteLayer routes={activeRoutes} isVisible={overlays.routes} />

      {/* Layer 8: Incident markers */}
      <IncidentMarkerLayer
        incidents={incidents}
        activeIncidentId={activeIncidentId}
        isVisible={overlays.incidents}
        onIncidentClick={onIncidentClick}
        zoomLevel={zoomLevel}
      />

      {/* Layer 9: Selection highlight (topmost interactive layer) */}
      <SelectionLayer selectedZoneId={selectedZoneId} zones={zones} />

      {/* Layer 10: Hover tooltip (absolutely topmost) */}
      <ZoneTooltip
        hoveredZoneId={hoveredZoneId}
        zones={zones}
        zoneCrowdDensity={zoneCrowdDensity}
        incidents={incidents}
      />

      {/* Compass rose */}
      <CompassRose />
    </svg>
  );
}

function CompassRose() {
  return (
    <g transform="translate(762, 50)" aria-label="Compass — North indicator">
      <circle cx={0} cy={0} r={12} fill="var(--surface-1)" fillOpacity={0.9} stroke="var(--border)" strokeWidth={1} />
      <polygon points="0,-9 3,-3 -3,-3" fill="var(--primary)" />
      <polygon points="0,9 3,3 -3,3" fill="var(--foreground-subtle)" />
      <text x={0} y={-13} textAnchor="middle" fontSize={6} fontWeight={700} fill="var(--primary)" fontFamily="var(--font-mono, monospace)">N</text>
    </g>
  );
}
