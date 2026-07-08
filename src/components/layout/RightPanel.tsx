'use client';

import { cn } from '@/utils/cn';
import { usePathname } from 'next/navigation';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { SkeletonLine } from '@/components/shared/SkeletonLine';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useIncidentStore } from '@/store/modules/incident';


function PanelSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'px-4 py-3 border-b border-(--border) last:border-b-0',
        className
      )}
      aria-label={title}
    >
      <SectionHeader
        title={title}
        className="mb-3"
      />
      {children}
    </section>
  );
}

function CurrentMatch() {
  const telemetry = useIncidentStore((state) => state.telemetry);

  // Extract match minute and occupancy
  const matchMinute = telemetry?.matchTimeline?.value?.minute ?? 0;
  const period = telemetry?.matchTimeline?.value?.period ?? 'pre-match';
  const occupancyPercent = telemetry?.stadiumCapacity?.value ?? 0;

  // Calculate match time progress (max 90 minutes)
  const matchProgress = Math.min(100, Math.max(0, (matchMinute / 90) * 100));

  // Determine display values for stats grid
  const attendance = telemetry 
    ? Math.round(80000 * (occupancyPercent / 100)).toLocaleString() 
    : '87,432';
  const capacityLabel = telemetry 
    ? `${occupancyPercent}%` 
    : '92%';
  
  let minLabel = '67′';
  if (telemetry) {
    if (period === 'pre-match') {
      minLabel = 'Pre-M';
    } else if (period === 'halftime') {
      minLabel = 'HT';
    } else if (period === 'post-match') {
      minLabel = 'FT';
    } else {
      minLabel = `${matchMinute}′`;
    }
  }

  return (
    <PanelSection title="Current Match">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-(--foreground)">
            Brazil vs Argentina
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 live-indicator">
            LIVE
          </span>
        </div>

        {telemetry ? (
          <div className="space-y-2 mt-1">
            {/* Match Time Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-(--foreground-muted) font-mono">
                <span>Match Time</span>
                <span>{period === 'pre-match' ? 'Ingress' : `${Math.max(0, matchMinute)}′ / 90′`}</span>
              </div>
              <div className="w-full bg-(--surface-3) rounded-full h-1.5 overflow-hidden border border-(--border)">
                <div
                  className="bg-(--primary) h-full rounded-full transition-all duration-500"
                  style={{ width: `${matchProgress}%` }}
                />
              </div>
            </div>

            {/* Capacity Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-(--foreground-muted) font-mono">
                <span>Stadium Capacity</span>
                <span>{occupancyPercent}%</span>
              </div>
              <div className="w-full bg-(--surface-3) rounded-full h-1.5 overflow-hidden border border-(--border)">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${occupancyPercent}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <SkeletonLine width="3/4" className="h-2.5" />
              <SkeletonLine width="1/2" className="h-2" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1 text-center mt-2">
          {[
            { label: 'Attendance', value: attendance },
            { label: 'Capacity', value: capacityLabel },
            { label: 'Min', value: minLabel },
          ].map((stat) => (
            <div key={stat.label} className="bg-(--surface-2) rounded-sm p-1.5">
              <p className="text-[11px] font-bold text-(--foreground) font-mono tabular-nums">
                {stat.value}
              </p>
              <p className="text-[9px] text-(--foreground-subtle) leading-tight mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PanelSection>
  );
}

function WeatherPanel() {
  return (
    <PanelSection title="Weather">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-(--foreground) font-mono leading-none">
            28°C
          </p>
          <p className="text-xs text-(--foreground-muted) mt-0.5">
            Partly cloudy
          </p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[10px] text-(--foreground-subtle)">
            Humidity <span className="font-semibold text-(--foreground)">62%</span>
          </p>
          <p className="text-[10px] text-(--foreground-subtle)">
            Wind <span className="font-semibold text-(--foreground)">14 km/h</span>
          </p>
          <p className="text-[10px] text-(--foreground-subtle)">
            UV Index <span className="font-semibold text-(--foreground)">Moderate</span>
          </p>
        </div>
      </div>
    </PanelSection>
  );
}

function SystemHealth() {
  const services = [
    { name: 'AI Engine', level: 'operational' as const },
    { name: 'CCTV Feed', level: 'operational' as const },
    { name: 'Transport API', level: 'degraded' as const },
    { name: 'Alert System', level: 'operational' as const },
  ];

  return (
    <PanelSection title="System Health">
      <ul className="space-y-2" aria-label="Service statuses">
        {services.map((svc) => (
          <li key={svc.name} className="flex items-center justify-between">
            <span className="text-xs text-(--foreground-muted)">{svc.name}</span>
            <StatusBadge level={svc.level} label={svc.level === 'operational' ? 'Online' : 'Degraded'} />
          </li>
        ))}
      </ul>
    </PanelSection>
  );
}

function QuickActions() {
  const actions = [
    { id: 'deploy', label: 'Deploy Security Team', accent: 'var(--primary)' },
    { id: 'alert', label: 'Broadcast Alert', accent: 'var(--color-error)' },
    { id: 'close-gate', label: 'Close Gate Section', accent: 'var(--color-warning)' },
  ];

  return (
    <PanelSection title="Quick Actions">
      <div className="space-y-1.5">
        {actions.map((action) => (
          <button
            key={action.id}
            className={cn(
              'w-full text-left text-xs font-medium px-3 py-2 rounded-sm',
              'border border-(--border) bg-(--surface-2)',
              'hover:bg-(--surface-3) hover:border-(--border-strong)',
              'transition-colors duration-150',
              'focus-visible:outline-(--focus-ring)'
            )}
            aria-label={action.label}
            aria-disabled="true"
          >
            {action.label}
          </button>
        ))}
      </div>
    </PanelSection>
  );
}

function OperationsNotes() {
  return (
    <PanelSection title="Operations Notes">
      <div
        className={cn(
          'w-full min-h-18 p-2.5 text-xs text-(--foreground-subtle)',
          'bg-(--surface-2) border border-(--border) rounded-sm',
          'italic'
        )}
        role="note"
        aria-label="Operations notes placeholder"
      >
        Notes and shift handover comments will appear here…
      </div>
    </PanelSection>
  );
}

function RecentAlerts() {
  const alerts = [
    { id: 'a1', message: 'Gate 7 — overcrowding detected', level: 'high', time: '2m ago' },
    { id: 'a2', message: 'Medical team dispatched to sector C', level: 'medium', time: '8m ago' },
    { id: 'a3', message: 'Transport delay on Line 2', level: 'low', time: '15m ago' },
  ];

  const levelColor: Record<string, string> = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-400',
  };

  return (
    <PanelSection title="Recent Alerts">
      <ul className="space-y-2.5" aria-label="Recent alert list">
        {alerts.map((alert) => (
          <li key={alert.id} className="flex items-start gap-2.5">
            <span
              className={cn('mt-1.5 w-1.5 h-1.5 rounded-full shrink-0', levelColor[alert.level] ?? 'bg-gray-400')}
              aria-label={`${alert.level} priority`}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-(--foreground) leading-snug truncate-2">
                {alert.message}
              </p>
              <p className="text-[10px] text-(--foreground-subtle) mt-0.5">{alert.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </PanelSection>
  );
}

export function RightPanel() {
  const pathname = usePathname();
  if (pathname === '/map') return null;

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col shrink-0 w-(--right-panel-width)',
        'bg-(--surface-1) border-l border-(--border)',
        'overflow-y-auto'
      )}
      aria-label="Operations context panel"
      role="complementary"
    >
      <div className="shrink-0 px-4 py-3 border-b border-(--border)">
        <h2 className="text-xs font-semibold text-(--foreground) tracking-tight">
          Operations Panel
        </h2>
        <p className="text-[10px] text-(--foreground-subtle) mt-0.5">
          FIFA WC 2026 · Al Bayt Stadium
        </p>
      </div>

      <CurrentMatch />
      <WeatherPanel />
      <SystemHealth />
      <QuickActions />
      <OperationsNotes />
      <RecentAlerts />
    </aside>
  );
}
