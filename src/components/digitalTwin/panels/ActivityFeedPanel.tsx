'use client';

/**
 * ActivityFeedPanel — Live Operational Activity Feed
 *
 * Right-bottom panel showing recent operational events grouped
 * into time sections: Now (< 5min), Recent (5–30min), Earlier.
 * Events sourced from the existing ActivityItem feed in the incident store.
 */
import { m, AnimatePresence } from 'framer-motion';
import { Activity, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { ActivityItem } from '@/types/incident';
import { getActivityTimeGroup, type ActivityTimeGroup } from '@/utils/digitalTwin';

interface ActivityFeedPanelProps {
  activities: ActivityItem[];
}

const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-red-500 ring-red-500/20',
  high: 'bg-amber-500 ring-amber-500/20',
  medium: 'bg-yellow-400 ring-yellow-400/20',
  low: 'bg-emerald-550 dark:bg-emerald-400 ring-emerald-500/20',
};

const GROUP_LABELS: Record<ActivityTimeGroup, string> = {
  now: '● Active Now',
  recent: 'Recent',
  earlier: 'Earlier',
};

const GROUP_LABEL_STYLE: Record<ActivityTimeGroup, string> = {
  now: 'text-emerald-600 dark:text-emerald-450 font-bold',
  recent: 'text-(--foreground-subtle) font-medium',
  earlier: 'text-(--foreground-subtle) font-medium',
};

function formatActivityTime(isoTime: string): string {
  try {
    const d = new Date(isoTime);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return isoTime;
  }
}

export function ActivityFeedPanel({ activities }: ActivityFeedPanelProps) {
  // Group activities into time buckets
  const grouped: Record<ActivityTimeGroup, ActivityItem[]> = {
    now: [],
    recent: [],
    earlier: [],
  };

  activities.slice(0, 40).forEach((item) => {
    const group = getActivityTimeGroup(item.time);
    grouped[group].push(item);
  });

  const groups: ActivityTimeGroup[] = ['now', 'recent', 'earlier'];

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-(--surface-1)">
      {/* Header */}
      <div className="px-4 py-3 border-b border-(--border) shrink-0 bg-(--surface-1)">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity size={12} className="text-(--primary)" aria-hidden="true" />
            <span className="text-[9px] font-bold text-(--foreground) uppercase tracking-wide font-mono">
              Activity Feed
            </span>
          </div>
          <span className="text-[8px] font-mono text-(--foreground-subtle)">
            {activities.length} events
          </span>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar-always">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <Clock size={14} className="text-(--foreground-subtle) opacity-30 mb-1.5" aria-hidden="true" />
            <p className="text-[10px] text-(--foreground-subtle)">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => {
              const items = grouped[group];
              if (items.length === 0) return null;
              return (
                <div key={group} className="relative">
                  {/* Group label */}
                  <div className="flex items-center gap-1.5 py-1 sticky top-0 bg-(--surface-1) z-10 -mx-1 px-1">
                    <span className={cn('text-[8px] font-mono uppercase tracking-wider', GROUP_LABEL_STYLE[group])}>
                      {GROUP_LABELS[group]}
                    </span>
                    <div className="flex-1 h-px bg-(--border)/60" aria-hidden="true" />
                    <span className="text-[8px] font-mono text-(--foreground-subtle)">{items.length}</span>
                  </div>

                  {/* Timeline items container */}
                  <div className="relative mt-1 space-y-1">
                    {/* Vertical timeline line */}
                    <div className="absolute left-3.25 top-2 bottom-3 w-px bg-(--border)/60" aria-hidden="true" />

                    <AnimatePresence>
                      {items.map((item, idx) => {
                        const isNow = group === 'now';
                        return (
                          <m.div
                            key={item.id}
                            initial={{ opacity: 0, x: 6 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, delay: idx * 0.01 }}
                            className="relative pl-6 pr-1 py-1 group/item cursor-default"
                          >
                            {/* Timeline Node */}
                            <div className="absolute left-2.5 top-2.5 z-10">
                              <span
                                className={cn(
                                  'block w-1.5 h-1.5 rounded-full ring-2 ring-(--surface-1)',
                                  item.severity ? SEVERITY_DOT[item.severity] : 'bg-gray-300 ring-gray-200',
                                  isNow && 'animate-pulse'
                                )}
                                aria-hidden="true"
                              />
                              {isNow && (
                                <span className="absolute -top-1 -left-1 w-3.5 h-3.5 rounded-full border border-emerald-500/30 animate-ping pointer-events-none" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex flex-col gap-0.5 rounded px-2 py-1.5 hover:bg-(--surface-2)/45 transition-colors duration-150">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[10px] text-(--foreground) leading-snug font-medium pr-1">
                                  {item.message}
                                </p>
                                <span className="text-[8px] font-mono text-(--foreground-subtle) shrink-0 whitespace-nowrap pt-0.5" suppressHydrationWarning>
                                  {formatActivityTime(item.time)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[8px] font-mono text-(--foreground-subtle) uppercase tracking-wide">
                                  {item.actor}
                                </span>
                              </div>
                            </div>
                          </m.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom fade gradient to signal more content to scroll */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-(--surface-1) to-transparent pointer-events-none z-15" />
    </div>
  );
}

