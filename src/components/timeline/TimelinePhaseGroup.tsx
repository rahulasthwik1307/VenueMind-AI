'use client';

import { ActivityItem } from '@/types/incident';
import { TimelineEntryRow } from './TimelineEntryRow';

interface TimelinePhaseGroupProps {
  phase: string;
  activities: ActivityItem[];
}

const getPhaseLabel = (phase: string) => {
  switch (phase) {
    case 'pre-match':
      return 'Pre-Match Warmup';
    case 'first-half':
      return 'First Half';
    case 'halftime':
      return 'Halftime Interval';
    case 'second-half':
      return 'Second Half';
    case 'post-match':
      return 'Post-Match Wrapup';
    default:
      return 'General Activity';
  }
};

export function TimelinePhaseGroup({ phase, activities }: TimelinePhaseGroupProps) {
  if (activities.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby={`phase-title-${phase}`}>
      <div className="flex items-center gap-3">
        <h3
          id={`phase-title-${phase}`}
          className="text-[10px] font-bold text-(--foreground-subtle) uppercase tracking-wider shrink-0 bg-(--background) pr-2"
        >
          {getPhaseLabel(phase)}
        </h3>
        <div className="h-[1px] bg-(--border) flex-1" />
      </div>

      <ol className="divide-y divide-(--border) border border-(--border) rounded-xl overflow-hidden bg-(--surface-1)">
        {activities.map((activity) => (
          <TimelineEntryRow key={activity.id} activity={activity} />
        ))}
      </ol>
    </section>
  );
}
