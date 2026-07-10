'use client';

/**
 * LiveMetricsPanel — Real-time Telemetry Metrics
 *
 * Shows live data from the Simulation Engine telemetry:
 * - Crowd Density
 * - Weather conditions
 * - Transport Status
 * - Match phase / minute
 * - Medical readiness
 * - System Health
 *
 * All data flows from the incident store — no local state.
 */

import { m } from 'framer-motion';
import { Users, Cloud, Bus, Clock, HeartPulse, Cpu, Thermometer } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { StadiumTelemetry } from '@/types/telemetry';
import { crowdDensityColor } from '@/utils/digitalTwin';

interface LiveMetricsPanelProps {
  telemetry: StadiumTelemetry | null;
}

function MetricBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full h-1 bg-(--surface-3) dark:bg-(--surface-3)/40 rounded-full overflow-hidden">
      <m.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ type: 'spring', stiffness: 85, damping: 15 }}
        aria-hidden="true"
      />
    </div>
  );
}

type StatusLevel = 'good' | 'warn' | 'crit';
function statusLevel(val: string): StatusLevel {
  if (val === 'Good' || val === 'Healthy') return 'good';
  if (val === 'Delayed' || val === 'Degraded') return 'warn';
  return 'crit';
}

const STATUS_STYLES: Record<StatusLevel, string> = {
  good: 'text-emerald-700 dark:text-emerald-450 bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/30',
  warn: 'text-amber-700 dark:text-amber-450 bg-amber-500/10 border-amber-500/20 dark:border-amber-500/30',
  crit: 'text-red-700 dark:text-red-450 bg-red-500/10 border-red-500/20 dark:border-red-500/30',
};

const PERIOD_LABELS: Record<string, string> = {
  'pre-match': 'Pre-Match',
  'first-half': 'First Half',
  halftime: 'Half Time',
  'second-half': 'Second Half',
  'post-match': 'Post-Match',
};

export function LiveMetricsPanel({ telemetry }: LiveMetricsPanelProps) {
  if (!telemetry) {
    return (
      <div className="px-4 py-3 border-t border-(--border) bg-(--surface-1)">
        <div className="text-[10px] text-(--foreground-subtle) text-center py-4">
          Loading telemetry…
        </div>
      </div>
    );
  }

  const { crowdDensity, weather, transportStatus, matchTimeline, medicalAvailability, systemHealth } = telemetry;
  const densityColor = crowdDensityColor(crowdDensity.value);
  const period = matchTimeline.value.period;
  const minute = matchTimeline.value.minute;

  const transportSL = statusLevel(transportStatus.value);
  const cctvSL = statusLevel(systemHealth.value.cctv);
  const ticketingSL = statusLevel(systemHealth.value.ticketing);
  const scadaSL = statusLevel(systemHealth.value.scada);

  const weatherCondition = weather.value.condition;
  const isWeatherAlert = weatherCondition === 'Lightning Risk' || weatherCondition === 'Heavy Rain';

  return (
    <div className="px-4 py-3 border-t border-(--border) space-y-3 bg-(--surface-1)">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <Cpu size={12} className="text-(--primary)" aria-hidden="true" />
        <span className="text-[9px] font-bold text-(--foreground) uppercase tracking-wide font-mono">
          Live Telemetry
        </span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span className="text-[8px] font-mono font-bold tracking-wider text-(--foreground-muted)">LIVE</span>
        </span>
      </div>

      {/* Match phase */}
      <div className="flex items-center justify-between text-[10px] leading-none">
        <div className="flex items-center gap-1.5">
          <Clock size={10} className="text-(--foreground-subtle)" aria-hidden="true" />
          <span className="text-(--foreground-muted) font-medium">Match Phase</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-(--foreground) font-mono leading-none">
            {PERIOD_LABELS[period] ?? period}
          </span>
          {(period === 'first-half' || period === 'second-half') && (
            <span className="text-[9.5px] font-mono font-bold text-(--primary) leading-none">&apos;{minute}</span>
          )}
        </div>
      </div>

      {/* Crowd density */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] leading-none">
          <div className="flex items-center gap-1.5">
            <Users size={10} className="text-(--foreground-subtle)" aria-hidden="true" />
            <span className="text-(--foreground-muted) font-medium">Crowd Density</span>
          </div>
          <span className="text-[10px] font-bold font-mono" style={{ color: densityColor }}>
            {crowdDensity.value.toFixed(0)}%
          </span>
        </div>
        <MetricBar value={crowdDensity.value} color={densityColor} />
      </div>

      {/* Weather */}
      <div className="flex items-center justify-between text-[10px] leading-none">
        <div className="flex items-center gap-1.5">
          <Cloud size={10} className="text-(--foreground-subtle)" aria-hidden="true" />
          <span className="text-(--foreground-muted) font-medium">Weather Condition</span>
        </div>
        <div className="flex items-center gap-1">
          <Thermometer size={10} className="text-(--foreground-subtle) -mr-0.5" aria-hidden="true" />
          <span className="font-mono text-[9.5px] text-(--foreground-muted) mr-1">{weather.value.temperature}°C</span>
          <span className={cn(
            'text-[8.5px] font-bold px-1.5 py-0.2 rounded border leading-none',
            isWeatherAlert ? 'text-red-750 dark:text-red-400 bg-red-500/10 border-red-500/20' : 'text-(--foreground-muted) bg-(--surface-2)/60 border-(--border)',
          )}>
            {weatherCondition}
          </span>
        </div>
      </div>

      {/* Transport */}
      <div className="flex items-center justify-between text-[10px] leading-none">
        <div className="flex items-center gap-1.5">
          <Bus size={10} className="text-(--foreground-subtle)" aria-hidden="true" />
          <span className="text-(--foreground-muted) font-medium">Public Transport</span>
        </div>
        <span className={cn('text-[8.5px] font-bold px-1.5 py-0.2 rounded border leading-none', STATUS_STYLES[transportSL])}>
          {transportStatus.value}
        </span>
      </div>

      {/* Medical readiness */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] leading-none">
          <div className="flex items-center gap-1.5">
            <HeartPulse size={10} className="text-(--foreground-subtle)" aria-hidden="true" />
            <span className="text-(--foreground-muted) font-medium">Medical Units</span>
          </div>
          <span className="text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-450">
            {medicalAvailability.value} ready
          </span>
        </div>
        <MetricBar value={medicalAvailability.value * 10} color="var(--primary)" />
      </div>

      {/* System health row */}
      <div className="flex items-center gap-1.5 pt-1">
        {[
          { label: 'CCTV', level: cctvSL },
          { label: 'TKTS', level: ticketingSL },
          { label: 'SCAD', level: scadaSL },
        ].map(({ label, level }) => (
          <span
            key={label}
            className={cn('flex-1 text-center text-[8px] font-bold font-mono py-0.5 rounded border leading-none transition-colors duration-150', STATUS_STYLES[level])}
            aria-label={`${label}: ${level}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

