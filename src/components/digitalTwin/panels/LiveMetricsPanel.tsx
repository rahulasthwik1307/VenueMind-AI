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
    <div className="w-full h-1.5 bg-(--surface-3) rounded-full overflow-hidden">
      <m.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, value)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
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
  good: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  warn: 'text-amber-600 bg-amber-50 border-amber-200',
  crit: 'text-red-600 bg-red-50 border-red-200',
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
      <div className="px-3 py-3 border-t border-(--border)">
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
    <div className="px-3 py-2.5 border-t border-(--border) space-y-2.5">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <Cpu size={11} className="text-(--primary)" aria-hidden="true" />
        <span className="text-[9px] font-bold text-(--foreground) uppercase tracking-wide font-mono">
          Live Telemetry
        </span>
        <span className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          <span className="text-[8px] font-mono text-(--foreground-subtle)">LIVE</span>
        </span>
      </div>

      {/* Match phase */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock size={10} className="text-(--foreground-subtle)" aria-hidden="true" />
          <span className="text-[10px] text-(--foreground-subtle)">Phase</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-(--foreground) font-mono">
            {PERIOD_LABELS[period] ?? period}
          </span>
          {period === 'first-half' || period === 'second-half' ? (
            <span className="text-[9px] font-mono text-(--primary)">&apos;{minute}</span>
          ) : null}
        </div>
      </div>

      {/* Crowd density */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users size={10} className="text-(--foreground-subtle)" aria-hidden="true" />
            <span className="text-[10px] text-(--foreground-subtle)">Crowd</span>
          </div>
          <span className="text-[10px] font-bold font-mono" style={{ color: densityColor }}>
            {crowdDensity.value.toFixed(0)}%
          </span>
        </div>
        <MetricBar value={crowdDensity.value} color={densityColor} />
      </div>

      {/* Weather */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Cloud size={10} className="text-(--foreground-subtle)" aria-hidden="true" />
          <span className="text-[10px] text-(--foreground-subtle)">Weather</span>
        </div>
        <div className="flex items-center gap-1">
          <Thermometer size={9} className="text-(--foreground-subtle)" aria-hidden="true" />
          <span className="text-[9px] text-(--foreground-subtle)">{weather.value.temperature}°C</span>
          <span className={cn(
            'text-[9px] font-semibold px-1.5 py-0 rounded border',
            isWeatherAlert ? 'text-red-600 bg-red-50 border-red-200' : 'text-(--foreground) bg-(--surface-2) border-(--border)',
          )}>
            {weatherCondition}
          </span>
        </div>
      </div>

      {/* Transport */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Bus size={10} className="text-(--foreground-subtle)" aria-hidden="true" />
          <span className="text-[10px] text-(--foreground-subtle)">Transport</span>
        </div>
        <span className={cn('text-[9px] font-semibold px-1.5 py-0 rounded border', STATUS_STYLES[transportSL])}>
          {transportStatus.value}
        </span>
      </div>

      {/* Medical readiness */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <HeartPulse size={10} className="text-(--foreground-subtle)" aria-hidden="true" />
            <span className="text-[10px] text-(--foreground-subtle)">Medical Units</span>
          </div>
          <span className="text-[10px] font-bold font-mono text-emerald-600">
            {medicalAvailability.value} ready
          </span>
        </div>
        <MetricBar value={medicalAvailability.value * 10} color="#16a34a" />
      </div>

      {/* System health row */}
      <div className="flex items-center gap-1 pt-0.5">
        {[
          { label: 'CCTV', level: cctvSL },
          { label: 'TKTS', level: ticketingSL },
          { label: 'SCAD', level: scadaSL },
        ].map(({ label, level }) => (
          <span
            key={label}
            className={cn('flex-1 text-center text-[8px] font-bold font-mono py-0.5 rounded border', STATUS_STYLES[level])}
            aria-label={`${label}: ${level}`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
