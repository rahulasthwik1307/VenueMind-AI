'use client';

/**
 * DigitalTwinLayout — Master Digital Twin Page Layout
 *
 * Three-column enterprise layout:
 *   Left (280px): Incident Queue Panel
 *   Center (flex-1): Stadium Canvas + Zone Details
 *   Right (280px): AI Context Panel + Live Metrics + Activity Feed
 *
 * Staged entrance animation: toolbar → panels → stadium → overlays
 * Each step ~100ms apart for a total entrance of ~500ms.
 */

import { useRef, useMemo } from 'react';
import { m } from 'framer-motion';
import { useDigitalTwin } from '@/hooks/useDigitalTwin';
import { STADIUM_ZONES } from '@/data/stadium/stadiumZones';
import { deriveZoneStatus } from '@/utils/digitalTwin';
import type { ZoneStatus } from '@/types/digitalTwin';

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
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left panel (entrance: second) ──────────────────────────── */}
        <m.div
          variants={stageVariants}
          initial="hidden"
          animate="visible"
          transition={stageTransition(0.08)}
          className="w-72 shrink-0 flex flex-col border-r border-(--border) overflow-hidden"
        >
          <IncidentQueuePanel
            incidents={dt.sortedIncidents}
            activeIncidentId={dt.activeIncidentId}
            onIncidentClick={dt.handleIncidentClick}
          />
        </m.div>

        {/* ── Center: Stadium + Zone Details ────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
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
            className="h-44 shrink-0 overflow-hidden"
          >
            <ZoneDetailsPanel
              selectedZone={dt.selectedZone}
              incidentsInZone={dt.incidentsInSelectedZone}
              zoneCrowdDensity={dt.zoneCrowdDensity}
              onIncidentClick={dt.handleIncidentClick}
            />
          </m.div>
        </div>

        {/* ── Right panel (entrance: second, same delay as left) ──────── */}
        <m.div
          variants={stageVariants}
          initial="hidden"
          animate="visible"
          transition={stageTransition(0.08)}
          className="w-72 shrink-0 flex flex-col border-l border-(--border) overflow-hidden"
        >
          {/* AI Context Panel — scrollable, takes available space */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <AIContextPanel
              activeIncident={dt.activeIncident}
              activeAnalysis={dt.activeAnalysis}
              onDispatch={dt.handleDispatch}
              onDismiss={dt.handleDismiss}
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
        </m.div>
      </div>
    </div>
  );
}
