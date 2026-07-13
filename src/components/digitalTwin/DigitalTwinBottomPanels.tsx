import { m } from 'framer-motion';
import type { Variants, Transition } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ZoneDetailsPanel } from './panels/ZoneDetailsPanel';
import type { Incident } from '@/types/incident';
import type { StadiumZoneConfig } from '@/types/digitalTwin';

const stageTransition = (delay: number): Transition => ({
  duration: 0.35,
  ease: 'easeOut',
  delay,
});

const stageVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};

interface DigitalTwinBottomPanelsProps {
  isBottomCollapsed: boolean;
  onToggleBottom: () => void;
  selectedZone: StadiumZoneConfig | null;
  zoneCrowdDensity: Record<string, number>;
  incidentsInSelectedZone: Incident[];
  incidents: Incident[];
  onIncidentClick: (incidentId: string) => void;
}

export function DigitalTwinBottomPanels({
  isBottomCollapsed,
  onToggleBottom,
  selectedZone,
  zoneCrowdDensity,
  incidentsInSelectedZone,
  incidents,
  onIncidentClick,
}: DigitalTwinBottomPanelsProps) {
  // Pre-calculate density summaries
  const avgDensity = Math.round(
    Object.values(zoneCrowdDensity).reduce((a, b) => a + b, 0) /
      Math.max(1, Object.keys(zoneCrowdDensity).length)
  );
  
  const displayDensity = selectedZone
    ? (zoneCrowdDensity[selectedZone.id] ?? 30).toFixed(0)
    : avgDensity;

  const activeIncidentsCount = selectedZone
    ? incidentsInSelectedZone.filter((i) => i.status !== 'resolved').length
    : incidents.filter((i) => i.status !== 'resolved').length;

  return (
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
              onClick={onToggleBottom}
              className="w-9 h-9 border border-(--border) rounded-md flex items-center justify-center bg-(--surface-1) text-(--foreground-muted) hover:text-(--foreground) hover:bg-(--surface-3) transition-colors cursor-pointer"
              title="Expand panel"
              aria-label="Expand panel"
            >
              <ChevronUp size={16} />
            </button>
            <span className="text-[10px] font-mono font-bold text-(--foreground-muted) uppercase tracking-wide">
              {selectedZone ? `Zone Monitor: ${selectedZone.name}` : 'Stadium Monitor Active'}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-mono text-(--foreground-subtle)">
            <span>CROWD CAPACITY: {displayDensity}%</span>
            <span>•</span>
            <span>INCIDENTS: {activeIncidentsCount} Active</span>
          </div>
        </div>
      ) : (
        <div className="h-44 w-full overflow-hidden">
          <ZoneDetailsPanel
            selectedZone={selectedZone}
            incidentsInZone={incidentsInSelectedZone}
            zoneCrowdDensity={zoneCrowdDensity}
            onIncidentClick={onIncidentClick}
            allIncidents={incidents}
            onCollapseClick={onToggleBottom}
          />
        </div>
      )}
    </m.div>
  );
}
