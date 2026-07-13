'use client';

import { cn } from '@/utils/cn';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useIncident } from '@/hooks/useIncident';
import type { Severity } from '@/types/common';
import { m, AnimatePresence } from 'framer-motion';

const SEVERITY_DOT: Record<Severity, string> = {
  critical: 'bg-red-600',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

function getActivityTimeAgo(isoString: string) {
  try {
    const now = new Date();
    const past = new Date(isoString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1m ago';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
}

export function RecentActivity() {
  const activities = useIncident(
    useShallow((state) => state.activities)
  );

  const visibleActivities = useMemo(() => activities.slice(0, 5), [activities]);

  return (
    <section
      className={cn(
        'bg-(--surface-1) border border-(--border) rounded-card p-5'
      )}
      aria-label="Recent activity log"
    >
      <SectionHeader
        title="Recent Activity"
        description="Last 60 minutes"
      />

      <div className="overflow-hidden min-h-60">
        <ul className="relative space-y-0" aria-label="Activity timeline" role="list">
          <AnimatePresence initial={false}>
            {visibleActivities.map((item, index) => (
              <m.li
                key={item.id}
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="relative flex items-start gap-3 pb-4 last:pb-0"
              >
                {/* Timeline line */}
                {index < visibleActivities.length - 1 && (
                  <span
                    className="absolute left-1.75 top-4 bottom-0 w-px bg-(--border)"
                    aria-hidden="true"
                  />
                )}

                {/* Dot */}
                <span
                  className={cn(
                    'mt-1 w-3.5 h-3.5 rounded-full border-2 border-(--surface-1) shrink-0 z-10',
                    item.severity ? SEVERITY_DOT[item.severity] : 'bg-gray-400'
                  )}
                  aria-hidden="true"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-(--foreground) leading-snug truncate-2 font-medium">
                    {item.message}
                  </p>
                  <p className="text-[10px] text-(--foreground-subtle) mt-0.5" suppressHydrationWarning>
                    {item.actor} · {getActivityTimeAgo(item.time)}
                  </p>
                </div>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </section>
  );
}
