'use client';

import { cn } from '@/utils/cn';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, AlertTriangle, Lock } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { SkeletonLine } from '@/components/shared/SkeletonLine';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useIncidentStore } from '@/store/modules/incident';
import { useUIStore } from '@/store/modules/ui';
import { SharedNotes } from '@/components/shared/SharedNotes';

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
        'px-4 py-2 border-b border-(--border) last:border-b-0',
        className
      )}
      aria-label={title}
    >
      <SectionHeader
        title={title}
        className="mb-1.5"
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
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-(--foreground)">
            Brazil vs Argentina
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-700 live-indicator">
            LIVE
          </span>
        </div>

        {telemetry ? (
          <div className="space-y-1.5 mt-1">
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
            <div key={stat.label} className="bg-(--surface-2) rounded-sm py-1 px-1.5">
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
      <ul className="space-y-1" aria-label="Service statuses">
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
  const { addToast, addActivity } = useIncidentStore();
  const actions = [
    {
      id: 'deploy',
      label: 'Deploy Security Team',
      severity: 'high' as const,
      msg: 'Quick Action: Security Team dispatch initiated via Operations Panel',
      icon: Shield,
      borderColor: 'border-l-orange-500',
      iconColor: 'text-orange-500',
    },
    {
      id: 'alert',
      label: 'Broadcast Alert',
      severity: 'high' as const,
      msg: 'Quick Action: Global stadium warning broadcasted',
      icon: AlertTriangle,
      borderColor: 'border-l-red-500',
      iconColor: 'text-red-500',
    },
    {
      id: 'close-gate',
      label: 'Close Gate Section',
      severity: 'medium' as const,
      msg: 'Quick Action: Tactical gate closure sequence engaged',
      icon: Lock,
      borderColor: 'border-l-blue-500',
      iconColor: 'text-blue-500',
    },
  ];

  const handleAction = (label: string, severity: 'low' | 'medium' | 'high' | 'critical', msg: string) => {
    addToast(`${label} action dispatched`, 'success');
    addActivity(msg, 'Operations Center', severity);
  };

  return (
    <PanelSection title="Quick Actions" className="py-2">
      <div className="space-y-1.5">
        {actions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action.label, action.severity, action.msg)}
              className={cn(
                'w-full flex items-center gap-2 text-left text-xs font-semibold px-2.5 py-1.5 rounded-sm cursor-pointer',
                'border border-(--border) border-l-3 bg-(--surface-2) text-(--foreground-muted)',
                action.borderColor,
                'hover:bg-(--surface-3) hover:border-(--border-strong) hover:text-(--foreground)',
                'transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)'
              )}
              aria-label={action.label}
            >
              <ActionIcon size={12} className={cn('shrink-0', action.iconColor)} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </PanelSection>
  );
}

function OperationsNotes() {
  const { operationsNotes, setOperationsNotes, shiftNotes, addShiftNote, deleteShiftNote } = useUIStore();
  const { addToast, addActivity } = useIncidentStore();

  const handleSave = () => {
    if (!operationsNotes.trim()) return;
    addShiftNote(operationsNotes);
    addToast('Shift note saved', 'success');
    addActivity('Rahul Asthwik added a shift note', 'Rahul Asthwik', 'low');
  };

  const handleDelete = (id: string) => {
    deleteShiftNote(id);
    addToast('Shift note deleted', 'info');
  };

  return (
    <PanelSection title="Operations Notes" className="py-2">
      <SharedNotes
        draft={operationsNotes}
        notes={shiftNotes}
        onChangeDraft={setOperationsNotes}
        onSave={handleSave}
        onDelete={handleDelete}
        placeholder="Type a shift log entry (Ctrl+Enter to save)..."
        historyTitle="Shift Log"
        ariaLabel="Operations shift handover notes"
        maxHeightClass="max-h-36"
      />
    </PanelSection>
  );
}

function RecentAlerts() {
  const [collapsed, setCollapsed] = useState(true);
  const alerts = [
    { id: 'a1', message: 'Gate 7 — overcrowding detected', level: 'high', time: '2m ago' },
    { id: 'a2', message: 'Medical team dispatched to sector C', level: 'medium', time: '8m ago' },
    { id: 'a3', message: 'Transport delay on Line 2', level: 'low', time: '15m ago' },
  ];

  const alertStyles: Record<string, { border: string; bg: string }> = {
    high: { border: 'border-l-red-500', bg: 'bg-red-50/20 dark:bg-red-950/10' },
    medium: { border: 'border-l-yellow-500', bg: 'bg-yellow-50/20 dark:bg-yellow-950/10' },
    low: { border: 'border-l-blue-400', bg: 'bg-blue-50/20 dark:bg-blue-950/10' },
  };

  const renderAlert = (alert: typeof alerts[0]) => {
    const styles = alertStyles[alert.level] || alertStyles.low;
    return (
      <div
        key={alert.id}
        className={cn(
          'relative border border-(--border)/60 border-l-3 rounded-sm p-1.5 text-[10px] leading-snug space-y-0.5 animate-fade-in',
          styles.border,
          styles.bg
        )}
      >
        <div className="flex justify-between items-center text-[8px] font-mono text-(--foreground-subtle)">
          <span className="font-semibold uppercase tracking-wider">{alert.level} PRIORITY</span>
          <span>{alert.time}</span>
        </div>
        <p className="text-(--foreground-muted) whitespace-pre-wrap wrap-break-word leading-relaxed">
          {alert.message}
        </p>
      </div>
    );
  };

  return (
    <PanelSection title="Recent Alerts" className="py-2 border-b-0">
      <div className="space-y-1.5">
        {/* Most recent alert is always visible */}
        {alerts.length > 0 && renderAlert(alerts[0])}

        {/* Toggle for older alerts */}
        {alerts.length > 1 && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-(--foreground-subtle) hover:text-(--foreground) transition-colors mt-2 cursor-pointer"
            aria-expanded={!collapsed}
          >
            <span>{collapsed ? 'Show more alerts' : 'Hide alerts history'}</span>
            {collapsed ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
          </button>
        )}

        {/* Scrollable list of older alerts */}
        {!collapsed && alerts.length > 1 && (
          <ul
            className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5 mt-2 custom-scrollbar-always animate-fade-in"
            aria-label="Older alerts history"
            aria-live="polite"
          >
            {alerts.slice(1).map((alert) => (
              <li key={alert.id}>
                {renderAlert(alert)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </PanelSection>
  );
}

export function RightPanel() {
  const pathname = usePathname();
  if (pathname === '/map') return null;

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col shrink-0 w-(--right-panel-width) h-full',
        'bg-(--surface-1) border-l border-(--border) overflow-hidden'
      )}
      aria-label="Operations context panel"
      role="complementary"
    >
      <div className="shrink-0 px-4 py-3 border-b border-(--border) bg-(--surface-1)">
        <h2 className="text-xs font-bold text-(--foreground) uppercase tracking-wider">
          Operations Panel
        </h2>
        <p className="text-[9px] font-mono text-(--foreground-subtle) mt-0.5">
          FIFA WC 2026 · Al Bayt Stadium
        </p>
      </div>

      <div
        className="flex-1 overflow-y-auto divide-y divide-(--border) scrollbar-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)"
        tabIndex={0}
        role="region"
        aria-label="Operations panel content"
      >
        <CurrentMatch />
        <WeatherPanel />
        <SystemHealth />
        <QuickActions />
        <OperationsNotes />
        <RecentAlerts />
      </div>

      {/* Visual Terminus */}
      <div className="shrink-0 border-t border-(--border) bg-(--surface-2) px-4 py-2 text-center text-[9px] font-mono text-(--foreground-subtle)">
        <span>SECURE ENDPOINT · ACTIVE STATUS</span>
      </div>
    </aside>
  );
}
