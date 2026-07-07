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
  ChevronUp,
  AlertTriangle,
  Octagon,
  Cpu
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
            isLeftCollapsed ? 'w-14' : 'w-72'
          )}
        >
          {isLeftCollapsed ? (
            <div className="w-14 h-full flex flex-col items-center py-4 gap-6 bg-(--surface-1)">
              <button
                onClick={toggleLeft}
                className="w-9 h-9 border border-(--border) rounded-md flex items-center justify-center bg-(--surface-1) text-(--foreground-muted) hover:text-(--foreground) hover:bg-(--surface-3) transition-colors cursor-pointer"
                title="Expand panel"
                aria-label="Expand panel"
              >
                <ChevronRight size={18} />
              </button>
              <div className="flex flex-col gap-4 items-center">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-(--surface-2) border border-(--border) text-amber-500" title={`${openIncidentCount} Active Incidents`}>
                  <AlertTriangle size={15} />
                  {openIncidentCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-amber-500 text-white text-[9px] font-black font-mono">
                      {openIncidentCount}
                    </span>
                  )}
                </div>
                {criticalCount > 0 && (
                  <div 
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-red-955/40 border border-red-500/50 text-red-500 animate-pulse" 
                    title={`${criticalCount} Critical Incidents`}
                  >
                    <Octagon size={15} className="fill-red-500/10" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-72 h-full flex flex-col overflow-hidden">
              <IncidentQueuePanel
                incidents={dt.sortedIncidents}
                activeIncidentId={dt.activeIncidentId}
                onIncidentClick={dt.handleIncidentClick}
                onCollapseClick={toggleLeft}
              />
            </div>
          )}
        </m.div>

        {/* ── Center: Stadium + Zone Details ────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
          
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
              isBottomCollapsed ? 'h-11' : 'h-44'
            )}
          >
            {isBottomCollapsed ? (
              <div className="h-11 w-full flex items-center justify-between px-4 border-t border-(--border) bg-(--surface-1)">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleBottom}
                    className="w-9 h-9 border border-(--border) rounded-md flex items-center justify-center bg-(--surface-1) text-(--foreground-muted) hover:text-(--foreground) hover:bg-(--surface-3) transition-colors cursor-pointer"
                    title="Expand panel"
                    aria-label="Expand panel"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-(--foreground-muted) uppercase tracking-wide">
                    {dt.selectedZone ? `Zone Monitor: ${dt.selectedZone.name}` : 'Stadium Monitor Active'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[9px] font-mono text-(--foreground-subtle)">
                  <span>CROWD CAPACITY: {dt.selectedZone ? `${(dt.zoneCrowdDensity[dt.selectedZone.id] ?? 30).toFixed(0)}%` : `${Math.round(Object.values(dt.zoneCrowdDensity).reduce((a,b)=>a+b,0) / Math.max(1, Object.keys(dt.zoneCrowdDensity).length))}%`}</span>
                  <span>•</span>
                  <span>INCIDENTS: {dt.selectedZone ? dt.incidentsInSelectedZone.filter(i=>i.status!=='resolved').length : dt.incidents.filter(i=>i.status!=='resolved').length} Active</span>
                </div>
              </div>
            ) : (
              <div className="h-44 w-full overflow-hidden">
                <ZoneDetailsPanel
                  selectedZone={dt.selectedZone}
                  incidentsInZone={dt.incidentsInSelectedZone}
                  zoneCrowdDensity={dt.zoneCrowdDensity}
                  onIncidentClick={dt.handleIncidentClick}
                  allIncidents={dt.incidents}
                  onCollapseClick={toggleBottom}
                />
              </div>
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
            isRightCollapsed ? 'w-14' : 'w-72'
          )}
        >
          {isRightCollapsed ? (
            <div className="w-14 h-full flex flex-col items-center py-4 gap-6 bg-(--surface-1)">
              <button
                onClick={toggleRight}
                className="w-9 h-9 border border-(--border) rounded-md flex items-center justify-center bg-(--surface-1) text-(--foreground-muted) hover:text-(--foreground) hover:bg-(--surface-3) transition-colors cursor-pointer"
                title="Expand panel"
                aria-label="Expand panel"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex flex-col gap-4 items-center">
                {/* System Health */}
                <div 
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-950/40 border border-emerald-500/50 text-emerald-450"
                  title="System Health: 100% Nominal"
                >
                  <Cpu size={15} />
                </div>
                {/* Occupancy Indicator */}
                <div 
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-(--surface-2) border border-(--border) text-(--foreground-muted)"
                  title={`Stadium Occupancy: ${dt.telemetry?.stadiumCapacity.value ?? 62}%`}
                >
                  <span className="text-[8.5px] font-mono font-bold leading-none">
                    {dt.telemetry?.stadiumCapacity.value ?? 62}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
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
                  onCollapseClick={toggleRight}
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
          )}
        </m.div>
      </div>
    </div>
  );
}
