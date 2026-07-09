'use client';

import { cn } from '@/utils/cn';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { SkeletonLine } from '@/components/shared/SkeletonLine';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useIncidentStore } from '@/store/modules/incident';
import { useUIStore } from '@/store/modules/ui';

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
    { id: 'deploy', label: 'Deploy Security Team', severity: 'high' as const, msg: 'Quick Action: Security Team dispatch initiated via Operations Panel' },
    { id: 'alert', label: 'Broadcast Alert', severity: 'high' as const, msg: 'Quick Action: Global stadium warning broadcasted' },
    { id: 'close-gate', label: 'Close Gate Section', severity: 'medium' as const, msg: 'Quick Action: Tactical gate closure sequence engaged' },
  ];

  const handleAction = (label: string, severity: 'low' | 'medium' | 'high' | 'critical', msg: string) => {
    addToast(`${label} action dispatched`, 'success');
    addActivity(msg, 'Operations Center', severity);
  };

  return (
    <PanelSection title="Quick Actions" className="py-2">
      <div className="space-y-0.5">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.label, action.severity, action.msg)}
            className={cn(
              'w-full text-left text-xs font-semibold px-2.5 py-1 rounded-sm cursor-pointer',
              'border border-(--border) bg-(--surface-2) text-(--foreground-muted)',
              'hover:bg-(--surface-3) hover:border-(--border-strong) hover:text-(--foreground)',
              'transition-all duration-150',
              'focus-visible:outline-(--focus-ring)'
            )}
            aria-label={action.label}
          >
            {action.label}
          </button>
        ))}
      </div>
    </PanelSection>
  );
}

function OperationsNotes() {
  const { operationsNotes, setOperationsNotes, shiftNotes, addShiftNote, deleteShiftNote } = useUIStore();
  const { addToast, addActivity } = useIncidentStore();
  const [collapsed, setCollapsed] = useState(true);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <PanelSection title="Operations Notes" className="py-2">
      <div className="space-y-2">
        <textarea
          value={operationsNotes}
          onChange={(e) => setOperationsNotes(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a shift log entry (Ctrl+Enter to save)..."
          className={cn(
            'w-full min-h-14 p-2 text-xs text-(--foreground) placeholder:text-(--foreground-subtle)',
            'bg-(--surface-2) border border-(--border) rounded-sm resize-none',
            'focus:outline-none focus:ring-1 focus:ring-(--primary) focus:border-(--primary)',
            'transition-all'
          )}
          aria-label="Operations shift handover notes"
        />

        <div className="flex justify-between items-center">
          <span className="text-[9px] text-(--foreground-subtle)">
            Press Ctrl+Enter to save
          </span>
          <button
            onClick={handleSave}
            disabled={!operationsNotes.trim()}
            className={cn(
              'px-2 py-0.5 text-[9px] font-bold rounded-sm border transition-all duration-150 uppercase tracking-wide cursor-pointer',
              operationsNotes.trim()
                ? 'bg-(--primary) text-white border-(--primary) hover:bg-(--primary-hover)'
                : 'bg-(--surface-2) border-(--border) text-(--foreground-subtle) cursor-not-allowed'
            )}
          >
            Save
          </button>
        </div>

        {/* History Log */}
        {shiftNotes.length > 0 && (
          <div className="mt-2 pt-2 border-t border-(--border) space-y-1.5">
            <span className="text-[9px] font-bold text-(--foreground-subtle) uppercase tracking-wider block">
              Shift Log
            </span>

            {/* Most recent note */}
            <div className="relative bg-(--surface-2)/40 border border-(--border)/60 rounded-sm p-1.5 text-[10px] leading-snug space-y-0.5 animate-fade-in group">
              <div className="flex justify-between items-center text-[8px] font-mono text-(--foreground-subtle) pr-4">
                <span className="font-semibold">Rahul Asthwik</span>
                <span>{shiftNotes[0].timestamp}</span>
              </div>
              <p className="text-(--foreground-muted) whitespace-pre-wrap break-words">
                {shiftNotes[0].content}
              </p>
              <button
                onClick={() => handleDelete(shiftNotes[0].id)}
                className={cn(
                  'absolute top-1 right-1 text-(--foreground-subtle) hover:text-red-500 p-0.5 rounded cursor-pointer transition-colors',
                  'focus-visible:outline-(--focus-ring) focus-visible:ring-1'
                )}
                aria-label="Delete note"
              >
                <X size={10} />
              </button>
            </div>

            {/* Toggle for older history */}
            {shiftNotes.length > 1 && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="w-full flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-(--foreground-subtle) hover:text-(--foreground) transition-colors mt-2 cursor-pointer"
                aria-expanded={!collapsed}
              >
                <span>{collapsed ? 'Show more history' : 'Hide history'}</span>
                {collapsed ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
              </button>
            )}

            {/* Scrollable list of older notes */}
            {!collapsed && shiftNotes.length > 1 && (
              <ul
                className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5 mt-2 custom-scrollbar-always animate-fade-in"
                aria-label="Older shift log entries"
                aria-live="polite"
              >
                {shiftNotes.slice(1).map((note) => (
                  <li
                    key={note.id}
                    className="relative bg-(--surface-2)/30 border border-(--border)/40 rounded-sm p-1.5 text-[10px] leading-snug space-y-0.5"
                  >
                    <div className="flex justify-between items-center text-[8px] font-mono text-(--foreground-subtle) pr-4">
                      <span className="font-semibold">Rahul Asthwik</span>
                      <span>{note.timestamp}</span>
                    </div>
                    <p className="text-(--foreground-muted) whitespace-pre-wrap break-words">
                      {note.content}
                    </p>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className={cn(
                        'absolute top-1 right-1 text-(--foreground-subtle) hover:text-red-500 p-0.5 rounded cursor-pointer transition-colors',
                        'focus-visible:outline-(--focus-ring) focus-visible:ring-1'
                      )}
                      aria-label="Delete note"
                    >
                      <X size={10} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
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

  const levelColor: Record<string, string> = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-400',
  };

  return (
    <PanelSection title="Recent Alerts" className="py-2 border-b-0">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between text-[9px] font-bold uppercase tracking-wider text-(--foreground-subtle) hover:text-(--foreground) transition-colors mb-2 cursor-pointer"
        aria-expanded={!collapsed}
      >
        <span>Toggle Alerts History</span>
        {collapsed ? <ChevronDown size={10} /> : <ChevronUp size={10} />}
      </button>

      {!collapsed && (
        <ul className="space-y-2 animate-fade-in" aria-label="Recent alert list">
          {alerts.map((alert) => (
            <li key={alert.id} className="flex items-start gap-2">
              <span
                className={cn('mt-1.5 w-1.5 h-1.5 rounded-full shrink-0', levelColor[alert.level] ?? 'bg-gray-400')}
                aria-label={`${alert.level} priority`}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-(--foreground-muted) leading-snug truncate-2">
                  {alert.message}
                </p>
                <p className="text-[9px] text-(--foreground-subtle) mt-0.5">{alert.time}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
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
