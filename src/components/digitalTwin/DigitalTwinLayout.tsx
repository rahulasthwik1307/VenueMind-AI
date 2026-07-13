'use client';

/**
 * DigitalTwinLayout — Master Digital Twin Page Layout
 *
 * Three-column enterprise layout:
 *   Left (280px): Incident Queue Panel (Collapsible)
 *   Center (flex-1): Stadium Canvas + Zone Details (Collapsible)
 *   Right (280px): AI Context Panel + Live Metrics + Activity Feed (Collapsible)
 *
 * Persists layout preferences (isLeftCollapsed, isRightCollapsed, isBottomCollapsed)
 * inside localStorage. Supports keyboard shortcuts (Ctrl+[, Ctrl+], Ctrl+\).
 */

import { useRef, useMemo, useState, useEffect } from 'react';
import { useDigitalTwin } from '@/hooks/useDigitalTwin';
import { STADIUM_ZONES } from '@/data/stadium/stadiumZones';
import { deriveZoneStatus } from '@/utils/digitalTwin';
import type { ZoneStatus } from '@/types/digitalTwin';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

import { StadiumCanvas } from './stadium/StadiumCanvas';
import { ToolbarContainer } from './ToolbarContainer';
import { DigitalTwinPanels } from './DigitalTwinPanels';
import { DigitalTwinBottomPanels } from './DigitalTwinBottomPanels';
import { DigitalTwinWorkspace } from './DigitalTwinWorkspace';

export function DigitalTwinLayout() {
  const dt = useDigitalTwin();

  // Ref to expose canvas zoom controls to the toolbar
  const canvasControlsRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    reset: () => void;
  } | null>(null);

  // Panel Collapsible states
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  // Load operator layout preferences on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setIsLeftCollapsed(localStorage.getItem('layout_left_collapsed') === 'true');
        setIsRightCollapsed(localStorage.getItem('layout_right_collapsed') === 'true');
        setIsBottomCollapsed(localStorage.getItem('layout_bottom_collapsed') === 'true');
      } catch {
        // ignore
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Save layout helpers
  const toggleLeft = () => {
    const next = !isLeftCollapsed;
    setIsLeftCollapsed(next);
    try {
      localStorage.setItem('layout_left_collapsed', String(next));
    } catch {
      // ignore
    }
  };

  const toggleRight = () => {
    const next = !isRightCollapsed;
    setIsRightCollapsed(next);
    try {
      localStorage.setItem('layout_right_collapsed', String(next));
    } catch {
      // ignore
    }
  };

  const toggleBottom = () => {
    const next = !isBottomCollapsed;
    setIsBottomCollapsed(next);
    try {
      localStorage.setItem('layout_bottom_collapsed', String(next));
    } catch {
      // ignore
    }
  };

  // Bind Keyboard Hotkeys
  useKeyboardShortcuts({
    onToggleLeft: toggleLeft,
    onToggleAI: toggleRight,
    onToggleOps: toggleBottom,
    onZoomIn: () => canvasControlsRef.current?.zoomIn(),
    onZoomOut: () => canvasControlsRef.current?.zoomOut(),
    onResetView: () => canvasControlsRef.current?.reset(),
    onToggleOverlay: (overlay) => dt.toggleOverlay(overlay),
  });

  // Responsive Auto-Collapsing: hide secondary side panels on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setIsLeftCollapsed(true);
        setIsRightCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pre-compute zone statuses (one pass, not per-component)
  const zoneStatuses = useMemo<Record<string, ZoneStatus>>(() => {
    const result: Record<string, ZoneStatus> = {};
    STADIUM_ZONES.forEach((zone) => {
      const density = dt.zoneCrowdDensity[zone.id] ?? 30;
      result[zone.id] = deriveZoneStatus(zone.id, density, dt.incidents);
    });
    return result;
  }, [dt.zoneCrowdDensity, dt.incidents]);

  // Telemetry shortcuts
  const matchPeriod = dt.telemetry?.matchTimeline.value.period ?? null;
  const matchMinute = dt.telemetry?.matchTimeline.value.minute ?? 0;

  const openIncidentCount = dt.incidents.filter((i) => i.status !== 'resolved').length;
  const criticalCount = dt.incidents.filter(
    (i) => i.severity === 'critical' && i.status !== 'resolved',
  ).length;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-(--surface-1)">
      <ToolbarContainer
        matchPeriod={matchPeriod}
        matchMinute={matchMinute}
        activeOverlays={dt.activeOverlays}
        routeCount={dt.activeRoutes.length}
        openIncidentCount={openIncidentCount}
        criticalCount={criticalCount}
        onToggleOverlay={dt.toggleOverlay}
        onClearRoutes={dt.clearRoutes}
        onZoomIn={() => canvasControlsRef.current?.zoomIn()}
        onZoomOut={() => canvasControlsRef.current?.zoomOut()}
        onResetView={() => canvasControlsRef.current?.reset()}
      />

      <DigitalTwinPanels
        isLeftCollapsed={isLeftCollapsed}
        isRightCollapsed={isRightCollapsed}
        onToggleLeft={toggleLeft}
        onToggleRight={toggleRight}
        openIncidentCount={openIncidentCount}
        criticalCount={criticalCount}
        sortedIncidents={dt.sortedIncidents}
        activeIncidentId={dt.activeIncidentId}
        onIncidentClick={dt.handleIncidentClick}
        activeIncident={dt.activeIncident}
        activeAnalysis={dt.activeAnalysis}
        onDispatch={dt.handleDispatch}
        onDismiss={dt.handleDismiss}
        telemetry={dt.telemetry}
        incidents={dt.incidents}
        activities={dt.activities}
      >
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
          <DigitalTwinWorkspace>
            <StadiumCanvas
              zones={STADIUM_ZONES}
              incidents={dt.incidents}
              activeIncidentId={dt.activeIncidentId}
              selectedZoneId={dt.effectiveSelectedZoneId}
              hoveredZoneId={dt.hoveredZoneId}
              zoneCrowdDensity={dt.zoneCrowdDensity}
              zoneStatuses={zoneStatuses}
              activeRoutes={dt.activeRoutes}
              overlays={dt.activeOverlays}
              onZoneClick={dt.handleZoneSelect}
              onZoneHover={dt.setHoveredZone}
              onIncidentClick={dt.handleIncidentClick}
              controlsRef={canvasControlsRef}
            />
          </DigitalTwinWorkspace>

          <DigitalTwinBottomPanels
            isBottomCollapsed={isBottomCollapsed}
            onToggleBottom={toggleBottom}
            selectedZone={dt.selectedZone}
            zoneCrowdDensity={dt.zoneCrowdDensity}
            incidentsInSelectedZone={dt.incidentsInSelectedZone}
            incidents={dt.incidents}
            onIncidentClick={dt.handleIncidentClick}
          />
        </div>
      </DigitalTwinPanels>
    </div>
  );
}
