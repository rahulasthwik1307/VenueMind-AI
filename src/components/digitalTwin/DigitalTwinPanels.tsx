import { m } from 'framer-motion';
import type { Variants, Transition } from 'framer-motion';
import { ChevronLeft, ChevronRight, AlertTriangle, Octagon, Cpu } from 'lucide-react';
import { cn } from '@/utils/cn';
import { IncidentQueuePanel } from './panels/IncidentQueuePanel';
import { AIContextPanel } from './panels/AIContextPanel';
import { LiveMetricsPanel } from './panels/LiveMetricsPanel';
import { ActivityFeedPanel } from './panels/ActivityFeedPanel';
import type { Incident, IncidentAnalysis, ActivityItem } from '@/types/incident';
import type { StadiumTelemetry } from '@/types/telemetry';

const stageTransition = (delay: number): Transition => ({
  duration: 0.35,
  ease: 'easeOut',
  delay,
});

const stageVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

interface DigitalTwinPanelsProps {
  isLeftCollapsed: boolean;
  isRightCollapsed: boolean;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  openIncidentCount: number;
  criticalCount: number;
  sortedIncidents: Incident[];
  activeIncidentId: string | null;
  onIncidentClick: (incidentId: string) => void;
  
  activeIncident: Incident | null;
  activeAnalysis: IncidentAnalysis | null;
  onDispatch: (incidentId: string, recommendationId: string) => void;
  onDismiss: (incidentId: string, recommendationId: string) => void;
  telemetry: StadiumTelemetry | null;
  incidents: Incident[];
  activities: ActivityItem[];
  
  children: React.ReactNode;
}

export function DigitalTwinPanels({
  isLeftCollapsed,
  isRightCollapsed,
  onToggleLeft,
  onToggleRight,
  openIncidentCount,
  criticalCount,
  sortedIncidents,
  activeIncidentId,
  onIncidentClick,
  activeIncident,
  activeAnalysis,
  onDispatch,
  onDismiss,
  telemetry,
  incidents,
  activities,
  children,
}: DigitalTwinPanelsProps) {
  return (
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
              onClick={onToggleLeft}
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
              incidents={sortedIncidents}
              activeIncidentId={activeIncidentId}
              onIncidentClick={onIncidentClick}
              onCollapseClick={onToggleLeft}
            />
          </div>
        )}
      </m.div>

      {/* Center workspace passed as child */}
      {children}

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
              onClick={onToggleRight}
              className="w-9 h-9 border border-(--border) rounded-md flex items-center justify-center bg-(--surface-1) text-(--foreground-muted) hover:text-(--foreground) hover:bg-(--surface-3) transition-colors cursor-pointer"
              title="Expand panel"
              aria-label="Expand panel"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex flex-col gap-4 items-center">
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-950/40 border border-emerald-500/50 text-emerald-450"
                title="System Health: 100% Nominal"
              >
                <Cpu size={15} />
              </div>
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-full bg-(--surface-2) border border-(--border) text-(--foreground-muted)"
                title={`Stadium Occupancy: ${telemetry?.stadiumCapacity?.value ?? 62}%`}
              >
                <span className="text-[8.5px] font-mono font-bold leading-none">
                  {telemetry?.stadiumCapacity?.value ?? 62}%
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-72 h-full flex flex-col overflow-hidden bg-(--surface-1)">
            <div className="flex-1 overflow-hidden flex flex-col">
              <AIContextPanel
                activeIncident={activeIncident}
                activeAnalysis={activeAnalysis}
                onDispatch={onDispatch}
                onDismiss={onDismiss}
                telemetry={telemetry}
                incidents={incidents}
                onCollapseClick={onToggleRight}
              />
            </div>
            <div className="shrink-0">
              <LiveMetricsPanel telemetry={telemetry} />
            </div>
            <div className="h-44 shrink-0 border-t border-(--border) overflow-hidden">
              <ActivityFeedPanel activities={activities} />
            </div>
          </div>
        )}
      </m.div>
    </div>
  );
}
