import { cn } from '@/utils/cn';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { SystemStatusLevel } from '@/types/common';

interface ZoneStatus {
  id: string;
  name: string;
  capacity: number;
  level: SystemStatusLevel;
}

const STADIUM_ZONES: ZoneStatus[] = [
  { id: 'z-north', name: 'North Stand', capacity: 88, level: 'degraded' },
  { id: 'z-south', name: 'South Stand', capacity: 71, level: 'operational' },
  { id: 'z-east', name: 'East Stand', capacity: 65, level: 'operational' },
  { id: 'z-west', name: 'West Stand', capacity: 79, level: 'operational' },
  { id: 'z-vip', name: 'VIP Lounge', capacity: 55, level: 'operational' },
  { id: 'z-press', name: 'Press Box', capacity: 42, level: 'operational' },
];

function CapacityBar({ percent, level }: { percent: number; level: SystemStatusLevel }) {
  const barColor: Record<SystemStatusLevel, string> = {
    operational: 'bg-(--color-success)',
    degraded: 'bg-(--color-warning)',
    critical: 'bg-(--color-error)',
    offline: 'bg-(--foreground-subtle)',
  };

  return (
    <div
      className="w-full h-1.5 bg-(--surface-3) rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Capacity: ${percent}%`}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-500', barColor[level])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function LiveStadiumOverview() {
  return (
    <section
      className={cn(
        'bg-(--surface-1) border border-(--border) rounded-card p-5'
      )}
      aria-label="Live stadium overview"
    >
      <SectionHeader
        title="Live Stadium Overview"
        description="Al Bayt Stadium — real-time zone capacity"
        action={
          <div className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full bg-green-500 live-indicator"
              aria-hidden="true"
            />
            <span className="text-[10px] text-(--foreground-subtle) font-medium">
              Live
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STADIUM_ZONES.map((zone) => (
          <div
            key={zone.id}
            className={cn(
              'p-3 rounded-md border border-(--border)',
              'bg-(--surface-2)'
            )}
            role="region"
            aria-label={`${zone.name}: ${zone.capacity}% capacity`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-(--foreground)">
                {zone.name}
              </p>
              <StatusBadge
                level={zone.level}
                label={zone.level === 'operational' ? 'Normal' : 'High'}
                showDot={false}
              />
            </div>
            <CapacityBar percent={zone.capacity} level={zone.level} />
            <p className="mt-1.5 text-[10px] font-mono font-semibold text-(--foreground-muted) tabular-nums">
              {zone.capacity}% capacity
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
