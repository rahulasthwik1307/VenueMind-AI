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
import { m } from 'framer-motion';
import { useDigitalTwin } from '@/hooks/useDigitalTwin';
import { STADIUM_ZONES } from '@/data/stadium/stadiumZones';
import { deriveZoneStatus } from '@/utils/digitalTwin';
import type { ZoneStatus } from '@/types/digitalTwin';
import { cn } from '@/utils/cn';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';

import { DigitalTwinToolbar } from './DigitalTwinToolbar';
import { StadiumCanvas } from './stadium/StadiumCanvas';
import { IncidentQueuePanel } from './panels/IncidentQueuePanel';
import { AIContextPanel } from './panels/AIContextPanel';
import { LiveMetricsPanel } from './panels/LiveMetricsPanel';
import { ZoneDetailsPanel } from './panels/ZoneDetailsPanel';
import { ActivityFeedPanel } from './panels/ActivityFeedPanel';

import type { Variants, Transition } from 'framer-motion';

// Staged entrance variants
const stageTransition = (delay: number): Transition => ({
  duration: 0.35,
  ease: 'easeOut',
  delay,
});

const stageVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

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
    try {
      setIsLeftCollapsed(localStorage.getItem('layout_left_collapsed') === 'true');
      setIsRightCollapsed(localStorage.getItem('layout_right_collapsed') === 'true');
      setIsBottomCollapsed(localStorage.getItem('layout_bottom_collapsed') === 'true');
    } catch (e) {
      // ignore
    }
  }, []);

  // Save layout helpers
  const toggleLeft = () => {
    const next = !isLeftCollapsed;
    setIsLeftCollapsed(next);
    try {
      localStorage.setItem('layout_left_collapsed', String(next));
    } catch (e) {
      // ignore
    }
  };

  const toggleRight = () => {
    const next = !isRightCollapsed;
    setIsRightCollapsed(next);
    try {
      localStorage.setItem('layout_right_collapsed', String(next));
    } catch (e) {
      // ignore
    }
  };

  const toggleBottom = () => {
    const next = !isBottomCollapsed;
    setIsBottomCollapsed(next);
    try {
      localStorage.setItem('layout_bottom_collapsed', String(next));
    } catch (e) {
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
      {/* ── Toolbar (entrance: first) ─────────────────────────────────── */}
      <m.div
        variants={stageVariants}
        initial="hidden"
        animate="visible"
        transition={stageTransition(0)}
        className="shrink-0"
      >
        <DigitalTwinToolbar
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
      </m.div>

      {/* ── Main body ────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Left panel (entrance: second) ──────────────────────────── */}
        <m.div
          variants={stageVariants}
          initial="hidden"
          animate="visible"
          transition={stageTransition(0.08)}
          className={cn(
            'shrink-0 flex flex-col border-r border-(--border) overflow-visible transition-all duration-300 relative bg-(--surface-1)',
            isLeftCollapsed ? 'w-0 border-r-0' : 'w-72'
          )}
        >
          <div className="w-72 h-full flex flex-col overflow-hidden">
            <IncidentQueuePanel
              incidents={dt.sortedIncidents}
              activeIncidentId={dt.activeIncidentId}
              onIncidentClick={dt.handleIncidentClick}
            />
          </div>
          
          {/* Collapse Handle on Border */}
          {!isLeftCollapsed && (
            <button
              onClick={toggleLeft}
              className="absolute top-1/2 -right-3 -translate-y-1/2 z-30 flex items-center justify-center w-5 h-5 bg-(--surface-1) border border-(--border) rounded-full shadow-sm text-(--foreground-subtle) hover:text-(--foreground) hover:bg-(--surface-2) transition-all"
              title="Collapse Panel (Ctrl+[)"
            >
              <ChevronLeft size={11} />
            </button>
          )}
        </m.div>

        {/* ── Center: Stadium + Zone Details ────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
          
          {/* Expand Left Floating Tab */}
          {isLeftCollapsed && (
            <button
              onClick={toggleLeft}
              className="absolute top-1/2 left-0 -translate-y-1/2 z-30 flex items-center justify-center w-3.5 h-12 bg-(--surface-1) border-y border-r border-(--border) rounded-r shadow-sm text-(--foreground-subtle) hover:text-(--foreground) hover:bg-(--surface-2) transition-all"
              title="Expand Panel (Ctrl+[)"
            >
              <ChevronRight size={10} />
            </button>
          )}

          {/* Expand Right Floating Tab */}
          {isRightCollapsed && (
            <button
              onClick={toggleRight}
              className="absolute top-1/2 right-0 -translate-y-1/2 z-30 flex items-center justify-center w-3.5 h-12 bg-(--surface-1) border-y border-l border-(--border) rounded-l shadow-sm text-(--foreground-subtle) hover:text-(--foreground) hover:bg-(--surface-2) transition-all"
              title="Expand Panel (Ctrl+])"
            >
              <ChevronLeft size={10} />
            </button>
          )}

          {/* Expand Bottom Floating Tab */}
          {isBottomCollapsed && (
            <button
              onClick={toggleBottom}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1 bg-(--surface-1) border border-(--border) rounded-full shadow text-(--foreground-subtle) hover:text-(--foreground) hover:bg-(--surface-2) transition-all text-[8.5px] font-bold font-mono uppercase"
              title="Expand Details (Ctrl+\)"
            >
              <ChevronUp size={9} />
              <span>Expand Zone Analytics</span>
            </button>
          )}

          {/* Stadium Canvas (entrance: third) */}
          <m.div
            variants={stageVariants}
            initial="hidden"
            animate="visible"
            transition={stageTransition(0.16)}
            className="flex-1 overflow-hidden"
          >
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
          </m.div>

          {/* Zone Details Panel (bottom of center, entrance: fourth) */}
          <m.div
            variants={stageVariants}
            initial="hidden"
            animate="visible"
            transition={stageTransition(0.24)}
            className={cn(
              'shrink-0 overflow-visible transition-all duration-300 relative bg-(--surface-1)',
              isBottomCollapsed ? 'h-0' : 'h-44'
            )}
          >
            <div className="h-44 w-full overflow-hidden">
              <ZoneDetailsPanel
                selectedZone={dt.selectedZone}
                incidentsInZone={dt.incidentsInSelectedZone}
                zoneCrowdDensity={dt.zoneCrowdDensity}
                onIncidentClick={dt.handleIncidentClick}
                allIncidents={dt.incidents}
              />
            </div>
            
            {/* Collapse handle for bottom */}
            {!isBottomCollapsed && (
              <button
                onClick={toggleBottom}
                className="absolute -top-2.5 right-5 z-30 flex items-center justify-center w-5 h-5 bg-(--surface-1) border border-(--border) rounded-full shadow-sm text-(--foreground-subtle) hover:text-(--foreground) hover:bg-(--surface-2) transition-all"
                title="Collapse Details (Ctrl+\)"
              >
                <ChevronDown size={11} />
              </button>
            )}
          </m.div>
        </div>

        {/* ── Right panel (entrance: second, same delay as left) ──────── */}
        <m.div
          variants={stageVariants}
          initial="hidden"
          animate="visible"
          transition={stageTransition(0.08)}
          className={cn(
            'shrink-0 flex flex-col border-l border-(--border) overflow-visible transition-all duration-300 relative bg-(--surface-1)',
            isRightCollapsed ? 'w-0 border-l-0' : 'w-72'
          )}
        >
          <div className="w-72 h-full flex flex-col overflow-hidden bg-(--surface-1)">
            {/* AI Context Panel — scrollable, takes available space */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <AIContextPanel
                activeIncident={dt.activeIncident}
                activeAnalysis={dt.activeAnalysis}
                onDispatch={dt.handleDispatch}
                onDismiss={dt.handleDismiss}
                telemetry={dt.telemetry}
                incidents={dt.incidents}
              />
            </div>

            {/* Live Metrics — fixed compact section */}
            <div className="shrink-0">
              <LiveMetricsPanel telemetry={dt.telemetry} />
            </div>

            {/* Activity Feed — fixed-height bottom section */}
            <div className="h-44 shrink-0 border-t border-(--border) overflow-hidden">
              <ActivityFeedPanel activities={dt.activities} />
            </div>
          </div>

          {/* Collapse Handle on Border */}
          {!isRightCollapsed && (
            <button
              onClick={toggleRight}
              className="absolute top-1/2 -left-3 -translate-y-1/2 z-30 flex items-center justify-center w-5 h-5 bg-(--surface-1) border border-(--border) rounded-full shadow-sm text-(--foreground-subtle) hover:text-(--foreground) hover:bg-(--surface-2) transition-all"
              title="Collapse Panel (Ctrl+])"
            >
              <ChevronRight size={11} />
            </button>
          )}
        </m.div>
      </div>
    </div>
  );
}
