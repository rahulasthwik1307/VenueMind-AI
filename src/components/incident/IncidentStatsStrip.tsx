'use client';

/**
 * IncidentStatsStrip — 4-metric summary bar for the Incidents Console
 *
 * Exported pure function `computeAvgResponseTime` is unit-tested separately.
 */

import { useMemo } from 'react';
import { Users, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useIncidentStore } from '@/store/modules/incident';
import type { Incident } from '@/types/incident';

// ─── Pure Business Logic (Exported for Unit Testing) ─────────────────────────

/**
 * Computes the average response time (in minutes) for a list of incidents.
 *
 * Response time is defined as: time of first `resolution` timeline event minus `createdAt`.
 * Returns `null` if no incidents have a resolution event.
 *
 * @pure — no side effects, deterministic
 */
export function computeAvgResponseTime(incidents: Incident[]): number | null {
  const responseTimes: number[] = [];

  for (const incident of incidents) {
    const resolutionEvent = incident.timeline.find((e) => e.type === 'resolution');
    if (!resolutionEvent) continue;

    const createdMs = new Date(incident.createdAt).getTime();
    const resolvedMs = new Date(resolutionEvent.timestamp).getTime();
    const diffMinutes = (resolvedMs - createdMs) / 1000 / 60;

    if (diffMinutes >= 0) {
      responseTimes.push(diffMinutes);
    }
  }

  if (responseTimes.length === 0) return null;

  const avg = responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length;
  return Math.round(avg);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: 'primary' | 'warning' | 'error' | 'success';
}

function StatCard({ label, value, icon, accent = 'primary' }: StatCardProps) {
  const accentStyles = {
    primary: 'text-(--primary) bg-(--primary-muted)',
    warning: 'text-amber-500 bg-amber-950/20',
    error: 'text-red-500 bg-red-950/20',
    success: 'text-green-500 bg-green-950/20',
  };

  return (
    <div className="bg-(--surface-1) border border-(--border) rounded-xl p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${accentStyles[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-mono font-semibold text-(--foreground-subtle) uppercase tracking-wide leading-none">
          {label}
        </p>
        <p className="text-lg font-bold font-mono text-(--foreground) mt-0.5 leading-none tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}

export function IncidentStatsStrip() {
  const incidents = useIncidentStore((state) => state.incidents);

  const { totalActive, criticalOpen, resolvedToday, avgResponseTime } = useMemo(() => {
    const totalActive = incidents.filter((i) => i.status !== 'resolved').length;
    const criticalOpen = incidents.filter(
      (i) => i.severity === 'critical' && i.status !== 'resolved'
    ).length;
    const resolvedToday = incidents.filter((i) => i.status === 'resolved').length;
    const avgResponseTime = computeAvgResponseTime(incidents);
    return { totalActive, criticalOpen, resolvedToday, avgResponseTime };
  }, [incidents]);

  return (
    <div
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      role="region"
      aria-label="Incident queue statistics"
    >
      <StatCard
        label="Total Active"
        value={String(totalActive)}
        icon={<Users size={16} />}
        accent="primary"
      />
      <StatCard
        label="Critical Open"
        value={String(criticalOpen)}
        icon={<AlertTriangle size={16} />}
        accent={criticalOpen > 0 ? 'error' : 'success'}
      />
      <StatCard
        label="Resolved Today"
        value={String(resolvedToday)}
        icon={<CheckCircle size={16} />}
        accent="success"
      />
      <StatCard
        label="Avg Response"
        value={avgResponseTime !== null ? `${avgResponseTime}m` : '—'}
        icon={<Clock size={16} />}
        accent="warning"
      />
    </div>
  );
}
