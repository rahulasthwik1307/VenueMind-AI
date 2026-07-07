'use client';

/**
 * ZoneDetailsPanel — Selected Zone Operational Details
 *
 * Bottom-center panel showing:
 * - Zone metadata (name, type, capacity, occupancy)
 * - Assigned teams
 * - Linked incidents
 * - AI-generated operational assessment (from analysis of zone incidents)
 *
 * Fallback State:
 * - Dynamic Stadium-Wide Operations Summary Panel.
 */

import { m, AnimatePresence } from 'framer-motion';
import { MapPin, AlertTriangle, Shield, Brain, ChevronRight, ChevronDown, Users } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { StadiumZoneConfig, ZoneStatus } from '@/types/digitalTwin';
import type { Incident } from '@/types/incident';
import { crowdDensityColor, deriveZoneStatus } from '@/utils/digitalTwin';

interface ZoneDetailsPanelProps {
  selectedZone: StadiumZoneConfig | null;
  incidentsInZone: Incident[];
  zoneCrowdDensity: Record<string, number>;
  onIncidentClick: (id: string) => void;
  allIncidents?: Incident[];
  onCollapseClick?: () => void;
}

const STATUS_LABELS: Record<ZoneStatus, string> = {
  normal: 'Normal Operations',
  busy: 'Busy',
  high: 'High Pressure',
  critical: 'Critical',
  closed: 'Closed',
  evacuating: 'EVACUATING',
};

const STATUS_BADGE: Record<ZoneStatus, string> = {
  normal: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  busy: 'text-amber-700 bg-amber-50 border-amber-200',
  high: 'text-orange-700 bg-orange-50 border-orange-200',
  critical: 'text-red-700 bg-red-50 border-red-200',
  closed: 'text-gray-700 bg-gray-100 border-gray-300',
  evacuating: 'text-red-700 bg-red-100 border-red-400',
};

const TYPE_LABELS: Record<string, string> = {
  seating: 'Seating Zone',
  premium: 'Premium Zone',
  operations: 'Operations Hub',
  gate: 'Entry Gate',
  external: 'External Zone',
  services: 'Services Area',
  infrastructure: 'Infrastructure',
};

function generateZoneAssessment(
  zone: StadiumZoneConfig,
  status: ZoneStatus,
  density: number,
  incidents: Incident[],
): string {
  const openIncidents = incidents.filter((i) => i.status !== 'resolved');
  if (status === 'evacuating') {
    return `EVACUATION IN PROGRESS. AI recommends immediate activation of Emergency Protocol Echo-7. All available security and volunteer units should converge on ${zone.name}.`;
  }
  if (status === 'critical') {
    return `Critical pressure detected in ${zone.name}. Crowd density at ${density.toFixed(0)}% with ${openIncidents.length} unresolved incident${openIncidents.length !== 1 ? 's' : ''}. Recommend immediate resource redeployment.`;
  }
  if (status === 'high') {
    return `Elevated crowd pressure in ${zone.name} (${density.toFixed(0)}%). AI advises deploying additional stewards and monitoring access rates at nearby entry gates.`;
  }
  if (openIncidents.length > 0) {
    const primary = openIncidents[0];
    return `${zone.name} has ${openIncidents.length} active incident${openIncidents.length !== 1 ? 's' : ''}. Primary concern: "${primary?.title ?? 'Unknown'}". Telemetry within acceptable range.`;
  }
  return `${zone.name} reporting nominal status. Crowd density at ${density.toFixed(0)}%. No active incidents. All assigned teams are on standby.`;
}

export function ZoneDetailsPanel({
  selectedZone,
  incidentsInZone,
  zoneCrowdDensity,
  onIncidentClick,
  allIncidents = [],
  onCollapseClick,
}: ZoneDetailsPanelProps) {
  // Derive overall stadium stats for empty/fallback state
  const totalCapacity = 80000;
  const avgDensity = Math.round(
    Object.values(zoneCrowdDensity).reduce((a, b) => a + b, 0) /
      Math.max(1, Object.keys(zoneCrowdDensity).length)
  ) || 62;
  const computedOccupancy = Math.round((avgDensity / 100) * totalCapacity);

  const activeIncidents = allIncidents.filter((i) => i.status !== 'resolved');

  return (
    <div className="flex flex-col h-full overflow-hidden border-t border-(--border) bg-(--surface-1) relative">
      {onCollapseClick && (
        <button
          onClick={onCollapseClick}
          className="absolute top-2.5 right-4 w-8 h-8 border border-(--border) rounded-md flex items-center justify-center bg-(--surface-1) text-(--foreground-muted) hover:text-(--foreground) hover:bg-(--surface-3) transition-colors cursor-pointer z-30 shadow-sm"
          title="Collapse panel"
          aria-label="Collapse panel"
        >
          <ChevronDown size={16} />
        </button>
      )}
      <AnimatePresence mode="wait">
        {selectedZone ? (
          <m.div
            key={selectedZone.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
            className="flex gap-4 h-full px-4 py-3 overflow-hidden"
          >
            {/* ── Zone Identity ─────────────────────────────────────── */}
            <div className="shrink-0 space-y-1.5 min-w-48">
              <div className="flex items-center gap-1.5">
                <MapPin size={11} className="text-(--primary)" aria-hidden="true" />
                <span className="text-[9px] font-mono text-(--foreground-subtle) uppercase tracking-wider">
                  {TYPE_LABELS[selectedZone.type] ?? selectedZone.type}
                </span>
              </div>

              <h3 className="text-xs font-bold text-(--foreground) leading-tight">
                {selectedZone.name}
              </h3>

              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const density = zoneCrowdDensity[selectedZone.id] ?? 30;
                  const status = deriveZoneStatus(selectedZone.id, density, incidentsInZone);
                  return (
                    <span className={cn('text-[8.5px] font-bold px-1.5 py-0.5 rounded border font-mono uppercase', STATUS_BADGE[status])}>
                      {STATUS_LABELS[status]}
                    </span>
                  );
                })()}
                <span className="text-[9px] text-(--foreground-subtle) font-mono">
                  Cap: {selectedZone.capacity.toLocaleString()}
                </span>
              </div>

              {/* Crowd density bar */}
              {(() => {
                const density = zoneCrowdDensity[selectedZone.id] ?? 30;
                const color = crowdDensityColor(density);
                return (
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] font-mono">
                      <span className="text-(--foreground-subtle)">CROWD</span>
                      <span style={{ color }}>{density.toFixed(0)}%</span>
                    </div>
                    <div className="h-1 bg-(--surface-3) rounded-full overflow-hidden">
                      <m.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color }}
                        animate={{ width: `${Math.min(100, density)}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                );
              })()}

              <p className="text-[10px] text-(--foreground-muted) leading-relaxed line-clamp-2">
                {selectedZone.description}
              </p>
            </div>

            {/* Divider */}
            <div className="w-px bg-(--border) shrink-0" />

            {/* ── Active Incidents ──────────────────────────────────── */}
            <div className="shrink-0 w-52 overflow-y-auto space-y-1.5">
              <div className="flex items-center gap-1.5 mb-1 sticky top-0 bg-(--surface-1) pb-1">
                <AlertTriangle size={10} className="text-(--foreground-subtle)" aria-hidden="true" />
                <span className="text-[9px] font-bold text-(--foreground) uppercase tracking-wide font-mono">
                  Zone Incidents
                </span>
                <span className="ml-auto text-[9px] font-mono text-(--foreground-subtle)">
                  {incidentsInZone.filter((i) => i.status !== 'resolved').length} active
                </span>
              </div>

              {incidentsInZone.filter((i) => i.status !== 'resolved').length === 0 ? (
                <div className="text-[10px] text-(--foreground-subtle) text-center py-2 px-2 border border-dashed border-(--border) rounded-md min-h-[52px] flex items-center justify-center text-wrap break-words">
                  No active incidents in zone
                </div>
              ) : (
                incidentsInZone
                  .filter((i) => i.status !== 'resolved')
                  .map((inc) => (
                    <button
                      key={inc.id}
                      onClick={() => onIncidentClick(inc.id)}
                      className="w-full text-left flex items-center gap-1.5 p-1.5 rounded border border-(--border) hover:border-(--primary-light) hover:bg-(--primary-muted) transition-colors"
                      aria-label={`View incident: ${inc.title}`}
                    >
                      <div className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0',
                        inc.severity === 'critical' ? 'bg-red-500' :
                        inc.severity === 'high' ? 'bg-amber-500' :
                        inc.severity === 'medium' ? 'bg-yellow-400' : 'bg-emerald-500',
                      )} aria-hidden="true" />
                      <span className="text-[10px] text-(--foreground) truncate flex-1">{inc.title}</span>
                      <ChevronRight size={10} className="text-(--foreground-subtle) shrink-0" aria-hidden="true" />
                    </button>
                  ))
              )}
            </div>

            {/* Divider */}
            <div className="w-px bg-(--border) shrink-0" />

            {/* ── AI Zone Assessment ─────────────────────────── */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Brain size={11} className="text-(--primary)" aria-hidden="true" />
                <span className="text-[9px] font-bold text-(--foreground) uppercase tracking-wide font-mono">
                  AI Zone Assessment
                </span>
              </div>

              {(() => {
                const density = zoneCrowdDensity[selectedZone.id] ?? 30;
                const status = deriveZoneStatus(selectedZone.id, density, incidentsInZone);
                const assessment = generateZoneAssessment(selectedZone, status, density, incidentsInZone);
                return (
                  <div className="bg-(--surface-2) border border-(--border) rounded-md p-2.5">
                    <p className="text-[10px] text-(--foreground-muted) leading-relaxed">
                      {assessment}
                    </p>
                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-(--border)">
                      <Shield size={9} className="text-(--primary)" aria-hidden="true" />
                      <span className="text-[8px] font-mono text-(--foreground-subtle) uppercase tracking-wider">
                        VenueMind AI · Operational Assessment
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </m.div>
        ) : (
          // Dynamic Stadium-Wide Operations Overview Panel (No selected zone)
          <m.div
            key="idle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="flex gap-4 h-full px-4 py-3 overflow-hidden"
          >
            {/* ── Stadium Capacity Summary ─────────────────────────── */}
            <div className="shrink-0 space-y-1.5 min-w-48">
              <div className="flex items-center gap-1.5">
                <Users size={11} className="text-(--primary)" aria-hidden="true" />
                <span className="text-[9px] font-mono text-(--foreground-subtle) uppercase tracking-wider">
                  Stadium Attendance Status
                </span>
              </div>

              <h3 className="text-xs font-bold text-(--foreground) leading-none">
                Command Center Overview
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono uppercase">
                  Gates Stable
                </span>
                <span className="text-[9px] text-(--foreground-subtle) font-mono">
                  Total Capacity: {totalCapacity.toLocaleString()}
                </span>
              </div>

              {/* General occupancy status bar */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[9px] font-mono">
                  <span className="text-(--foreground-subtle)">EST. OCCUPANCY</span>
                  <span className="text-(--primary) font-bold">{avgDensity}% ({computedOccupancy.toLocaleString()})</span>
                </div>
                <div className="h-1 bg-(--surface-3) rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-(--primary)"
                    style={{ width: `${avgDensity}%` }}
                  />
                </div>
              </div>

              <p className="text-[9px] text-(--foreground-subtle) leading-relaxed">
                Stadium Operations Center is active. Ready to monitor all sectors, stands, entryways, and operations hubs.
              </p>
            </div>

            {/* Divider */}
            <div className="w-px bg-(--border) shrink-0" />

            {/* ── Active Incidents Queue Preview ────────────────────── */}
            <div className="shrink-0 w-52 overflow-y-auto space-y-1.5">
              <div className="flex items-center gap-1.5 mb-1 sticky top-0 bg-(--surface-1) pb-1">
                <AlertTriangle size={10} className="text-(--foreground-subtle)" aria-hidden="true" />
                <span className="text-[9px] font-bold text-(--foreground) uppercase tracking-wide font-mono">
                  Active Stadium-Wide
                </span>
                <span className="ml-auto text-[9px] font-mono text-(--foreground-subtle)">
                  {activeIncidents.length} active
                </span>
              </div>

              {activeIncidents.length === 0 ? (
                <div className="text-[10px] text-(--foreground-subtle) text-center py-2 px-2 border border-dashed border-(--border) rounded-md min-h-[52px] flex items-center justify-center text-wrap break-words">
                  Stadium is fully clear
                </div>
              ) : (
                activeIncidents.slice(0, 3).map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => onIncidentClick(inc.id)}
                    className="w-full text-left flex items-center gap-1.5 p-1 rounded border border-(--border) hover:border-(--primary-light) hover:bg-(--primary-muted) transition-colors"
                    aria-label={`View incident: ${inc.title}`}
                  >
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      inc.severity === 'critical' ? 'bg-red-500' :
                      inc.severity === 'high' ? 'bg-amber-500' :
                      inc.severity === 'medium' ? 'bg-yellow-400' : 'bg-emerald-500',
                    )} aria-hidden="true" />
                    <span className="text-[9.5px] text-(--foreground) truncate flex-1">{inc.title}</span>
                    <ChevronRight size={9} className="text-(--foreground-subtle) shrink-0" aria-hidden="true" />
                  </button>
                ))
              )}
            </div>

            {/* Divider */}
            <div className="w-px bg-(--border) shrink-0" />

            {/* ── General Command Center AI Assessment ────────────────── */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Brain size={11} className="text-(--primary)" aria-hidden="true" />
                <span className="text-[9px] font-bold text-(--foreground) uppercase tracking-wide font-mono">
                  Live Dispatch Analyst
                </span>
              </div>

              <div className="bg-(--surface-2) border border-(--border) rounded-md p-2.5">
                <p className="text-[10px] text-(--foreground-muted) leading-relaxed">
                  {activeIncidents.length > 0
                    ? `Operations system alert: ${activeIncidents.length} active event${activeIncidents.length > 1 ? 's' : ''} require attention. Recommended strategy is to isolate highest priority tasks and deploy nearby tactical stewards.`
                    : 'System is running within nominal metrics. Ambient temperature is 68°F. Wind direction is East. All emergency routes are clear. No crowd congestion warnings active.'}
                </p>
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-(--border)">
                  <Shield size={9} className="text-(--primary)" aria-hidden="true" />
                  <span className="text-[8px] font-mono text-(--foreground-subtle) uppercase tracking-wider">
                    FIFA Operations HQ · Live
                  </span>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
