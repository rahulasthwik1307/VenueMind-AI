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
  critical: 'bg-red-500',
  high: 'bg-amber-500',
  medium: 'bg-yellow-400',
  low: 'bg-emerald-400',
};

const GROUP_LABELS: Record<ActivityTimeGroup, string> = {
  now: '● Now',
  recent: 'Recent',
  earlier: 'Earlier',
};

const GROUP_LABEL_STYLE: Record<ActivityTimeGroup, string> = {
  now: 'text-emerald-600 font-bold',
  recent: 'text-(--foreground-subtle)',
  earlier: 'text-(--foreground-subtle)',
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
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Header */}
      <div className="px-3 pt-2.5 pb-1.5 border-b border-(--border) shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity size={11} className="text-(--primary)" aria-hidden="true" />
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
      <div className="flex-1 overflow-y-auto px-2 py-1.5 custom-scrollbar-always">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-center">
            <Clock size={14} className="text-(--foreground-subtle) opacity-30 mb-1.5" aria-hidden="true" />
            <p className="text-[10px] text-(--foreground-subtle)">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {groups.map((group) => {
              const items = grouped[group];
              if (items.length === 0) return null;
              return (
                <div key={group}>
                  {/* Group label */}
                  <div className="flex items-center gap-1.5 py-1 sticky top-0 bg-(--surface-1) z-10">
                    <span className={cn('text-[8px] font-mono uppercase tracking-wider', GROUP_LABEL_STYLE[group])}>
                      {GROUP_LABELS[group]}
                    </span>
                    <div className="flex-1 h-px bg-(--border)" aria-hidden="true" />
                    <span className="text-[8px] font-mono text-(--foreground-subtle)">{items.length}</span>
                  </div>

                  {/* Items */}
                  <AnimatePresence>
                    {items.map((item, idx) => (
                      <m.div
                        key={item.id}
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.02 }}
                        className="flex items-start gap-1.5 px-1 py-1.5 rounded hover:bg-(--surface-2) transition-colors"
                      >
                        {/* Severity dot */}
                        <div className="pt-1 shrink-0">
                          <span
                            className={cn(
                              'block w-1.5 h-1.5 rounded-full',
                              item.severity ? SEVERITY_DOT[item.severity] : 'bg-gray-300',
                            )}
                            aria-hidden="true"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-(--foreground) leading-snug line-clamp-2">
                            {item.message}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[8px] font-mono text-(--foreground-subtle) truncate">
                              {item.actor}
                            </span>
                            <span className="text-[8px] font-mono text-(--foreground-subtle)" suppressHydrationWarning>
                              · {formatActivityTime(item.time)}
                            </span>
                          </div>
                        </div>
                      </m.div>
                    ))}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom fade gradient to signal more content to scroll */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-(--surface-1) to-transparent pointer-events-none z-15" />
    </div>
  );
}
