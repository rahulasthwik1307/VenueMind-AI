/**
 * useDigitalTwin — Facade Hook
 *
 * The single public interface for the Interactive Stadium Digital Twin.
 * Combines the existing Incident Intelligence Layer (useIncidentStore)
 * with the new UI-only Digital Twin store.
 *
 * All cross-store synchronization logic lives here — NOT in components.
 *
 * Guarantees:
 *  - No business logic in components
 *  - No duplication of operational state
 *  - All panel sync driven through derived state
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useIncidentStore } from '@/store/modules/incident';
import { useDigitalTwinStore } from '@/store/modules/digitalTwin';
import { STADIUM_ZONES, getZoneById } from '@/data/stadium/stadiumZones';
import {
  mapIncidentLocationToZoneId,
  computeZoneCrowdDensity,
  deriveZoneStatus,
  severityWeight,
  generateRouteForDispatch,
} from '@/utils/digitalTwin';
import type { StadiumZoneConfig } from '@/types/digitalTwin';

export function useDigitalTwin() {
  // ── Operational state from existing Incident Intelligence Layer ────────────
  const incidents = useIncidentStore((s) => s.incidents);
  const analyses = useIncidentStore((s) => s.analyses);
  const activeIncidentId = useIncidentStore((s) => s.activeIncidentId);
  const telemetry = useIncidentStore((s) => s.telemetry);
  const stadiumStats = useIncidentStore((s) => s.stadiumStats);
  const activities = useIncidentStore((s) => s.activities);
  const setActiveIncidentId = useIncidentStore((s) => s.setActiveIncidentId);
  const storeDispatchAction = useIncidentStore((s) => s.dispatchAction);
  const storeDismissRecommendation = useIncidentStore((s) => s.dismissRecommendation);
  const markIncidentResolved = useIncidentStore((s) => s.markIncidentResolved);

  // ── UI-only state from Digital Twin store ─────────────────────────────────
  const selectedZoneId = useDigitalTwinStore((s) => s.selectedZoneId);
  const hoveredZoneId = useDigitalTwinStore((s) => s.hoveredZoneId);
  const activeOverlays = useDigitalTwinStore((s) => s.activeOverlays);
  const activeRoutes = useDigitalTwinStore((s) => s.activeRoutes);
  const isCameraFollowActive = useDigitalTwinStore((s) => s.isCameraFollowActive);

  const selectZone = useDigitalTwinStore((s) => s.selectZone);
  const setHoveredZone = useDigitalTwinStore((s) => s.setHoveredZone);
  const toggleOverlay = useDigitalTwinStore((s) => s.toggleOverlay);
  const addRoute = useDigitalTwinStore((s) => s.addRoute);
  const removeRoute = useDigitalTwinStore((s) => s.removeRoute);
  const clearRoutes = useDigitalTwinStore((s) => s.clearRoutes);
  const setCameraFollow = useDigitalTwinStore((s) => s.setCameraFollow);

  // ── Derived: active incident and analysis ─────────────────────────────────
  const activeIncident = incidents.find((i) => i.id === activeIncidentId) ?? null;
  const activeAnalysis = activeIncidentId ? analyses[activeIncidentId] ?? null : null;

  // ── Derived: zone for active incident ────────────────────────────────────
  const zoneForActiveIncident = activeIncident
    ? mapIncidentLocationToZoneId(activeIncident.location.zone)
    : null;

  // Effective selected zone: explicit selection || derived from active incident
  const effectiveSelectedZoneId = selectedZoneId ?? zoneForActiveIncident;

  // ── Derived: zone config for effective selection ──────────────────────────
  const selectedZone: StadiumZoneConfig | null =
    effectiveSelectedZoneId ? (getZoneById(effectiveSelectedZoneId) ?? null) : null;

  // ── Derived: per-zone crowd density (memoized ref to avoid re-compute) ────
  const zoneCrowdDensity = computeZoneCrowdDensity(telemetry, incidents);

  // ── Derived: incidents in selected zone ───────────────────────────────────
  const incidentsInSelectedZone = effectiveSelectedZoneId
    ? incidents.filter(
        (i) => mapIncidentLocationToZoneId(i.location.zone) === effectiveSelectedZoneId,
      )
    : [];

  // ── Derived: zone status ──────────────────────────────────────────────────
  const selectedZoneStatus = effectiveSelectedZoneId
    ? deriveZoneStatus(
        effectiveSelectedZoneId,
        zoneCrowdDensity[effectiveSelectedZoneId] ?? 30,
        incidents,
      )
    : null;

  // ── Sync: active incident → select its zone ───────────────────────────────
  const prevActiveIncidentId = useRef<string | null>(null);
  useEffect(() => {
    if (activeIncidentId === prevActiveIncidentId.current) return;
    prevActiveIncidentId.current = activeIncidentId;

    if (activeIncidentId && isCameraFollowActive) {
      const incident = incidents.find((i) => i.id === activeIncidentId);
      if (incident) {
        const zoneId = mapIncidentLocationToZoneId(incident.location.zone);
        if (zoneId && zoneId !== selectedZoneId) {
          selectZone(zoneId);
        }
      }
    }
  }, [activeIncidentId, incidents, isCameraFollowActive, selectZone, selectedZoneId]);

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Select a zone. Automatically finds and activates the most critical
   * unresolved incident in that zone so all panels sync.
   */
  const handleZoneSelect = useCallback(
    (zoneId: string | null) => {
      selectZone(zoneId);

      if (!zoneId) {
        setActiveIncidentId(null);
        return;
      }

      const zoneIncidents = incidents
        .filter(
          (i) =>
            mapIncidentLocationToZoneId(i.location.zone) === zoneId &&
            i.status !== 'resolved',
        )
        .sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity));

      setActiveIncidentId(zoneIncidents[0]?.id ?? null);
    },
    [incidents, selectZone, setActiveIncidentId],
  );

  /**
   * Select an incident from the queue. Focuses its zone and activates the
   * incident so the AI panel, timeline, zone details all update together.
   */
  const handleIncidentClick = useCallback(
    (incidentId: string) => {
      setActiveIncidentId(incidentId);
      const incident = incidents.find((i) => i.id === incidentId);
      if (incident) {
        const zoneId = mapIncidentLocationToZoneId(incident.location.zone);
        if (zoneId) selectZone(zoneId);
      }
    },
    [incidents, selectZone, setActiveIncidentId],
  );

  /**
   * Dispatch a recommendation. Triggers the existing Operations Engine and
   * adds an animated route to the Digital Twin overlay.
   */
  const handleDispatch = useCallback(
    (incidentId: string, recommendationId: string) => {
      storeDispatchAction(incidentId, recommendationId);

      const incident = incidents.find((i) => i.id === incidentId);
      const analysis = analyses[incidentId];
      const recommendation = analysis?.recommendations.find(
        (r) => r.id === recommendationId,
      );

      if (incident && recommendation) {
        const route = generateRouteForDispatch(incident, recommendation);
        if (route) {
          addRoute(route);
          // Auto-remove route after 45 seconds
          setTimeout(() => removeRoute(route.id), 45_000);
        }
      }
    },
    [analyses, incidents, addRoute, removeRoute, storeDispatchAction],
  );

  /**
   * Dismiss a recommendation without dispatching.
   */
  const handleDismiss = useCallback(
    (incidentId: string, recommendationId: string) => {
      storeDismissRecommendation(incidentId, recommendationId);
    },
    [storeDismissRecommendation],
  );

  // ── Sorted incidents for the Incident Queue ───────────────────────────────
  const sortedIncidents = [...incidents].sort((a, b) => {
    // Open/investigating before mitigated/resolved
    const statusOrder = { open: 0, investigating: 1, mitigated: 2, resolved: 3 };
    const statusDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
    if (statusDiff !== 0) return statusDiff;
    return severityWeight(b.severity) - severityWeight(a.severity);
  });

  return {
    // ── Operational state (from existing stores) ──────────────────────────
    incidents,
    sortedIncidents,
    analyses,
    activeIncidentId,
    activeIncident,
    activeAnalysis,
    telemetry,
    stadiumStats,
    activities,

    // ── UI state (from Digital Twin store) ───────────────────────────────
    selectedZoneId,
    effectiveSelectedZoneId,
    hoveredZoneId,
    activeOverlays,
    activeRoutes,
    isCameraFollowActive,

    // ── Derived data ─────────────────────────────────────────────────────
    selectedZone,
    selectedZoneStatus,
    incidentsInSelectedZone,
    zoneForActiveIncident,
    zoneCrowdDensity,
    allZones: STADIUM_ZONES,

    // ── Actions ───────────────────────────────────────────────────────────
    handleZoneSelect,
    handleIncidentClick,
    handleDispatch,
    handleDismiss,
    markIncidentResolved,
    setActiveIncidentId,
    setHoveredZone,
    toggleOverlay,
    clearRoutes,
    setCameraFollow,
    selectZone,
  };
}
