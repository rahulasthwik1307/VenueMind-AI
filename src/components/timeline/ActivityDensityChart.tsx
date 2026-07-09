'use client';

import { useState } from 'react';
import { ActivityItem } from '@/types/incident';
import { cn } from '@/utils/cn';

interface ActivityDensityChartProps {
  activities: ActivityItem[];
}

export function ActivityDensityChart({ activities }: ActivityDensityChartProps) {
  const [now] = useState(() => Date.now());

  // Let's create 12 buckets (10 minutes each, representing the last 120 minutes)
  const bucketCount = 12;
  const bucketSizeMs = 10 * 60 * 1000;

  const buckets = Array.from({ length: bucketCount }, () => 0);

  activities.forEach((act) => {
    const ageMs = now - new Date(act.time).getTime();
    const bucketIndex = Math.floor(ageMs / bucketSizeMs);
    if (bucketIndex >= 0 && bucketIndex < bucketCount) {
      // Buckets are ordered from oldest (left) to newest (right)
      buckets[bucketCount - 1 - bucketIndex]++;
    }
  });

  const maxVal = Math.max(...buckets, 1);

  return (
    <div className="bg-(--surface-2) border border-(--border) rounded-xl p-4 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-bold text-(--foreground-muted) uppercase tracking-wider">
          Activity Density (Last 2 Hours)
        </h4>
        <span className="text-[10px] font-mono text-(--foreground-subtle)">
          {activities.length} total operations events
        </span>
      </div>

      <div
        className="h-16 flex items-end gap-1.5 pt-2"
        role="img"
        aria-label={`Activity volume chart over the last 2 hours. Peak volume was ${maxVal} events in a 10-minute interval.`}
      >
        {buckets.map((count, i) => {
          const relativeTimeText = `${(bucketCount - i) * 10}m ago`;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center group h-full justify-end"
            >
              <div
                className={cn(
                  "w-full rounded-t-sm transition-all duration-300 group-hover:opacity-100",
                  count > 0 ? "bg-(--primary) group-hover:bg-(--primary-hover)" : "bg-(--border)"
                )}
                style={{
                  height: count > 0 ? `${(count / maxVal) * 100}%` : '4%',
                  opacity: count > 0 ? 0.3 + (count / maxVal) * 0.7 : 0.15
                }}
                title={`${count} events around ${relativeTimeText}`}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[8px] font-mono text-(--foreground-subtle) border-t border-(--border) pt-1.5 px-0.5">
        <span>120m ago</span>
        <span>60m ago</span>
        <span>Just now</span>
      </div>
    </div>
  );
}
