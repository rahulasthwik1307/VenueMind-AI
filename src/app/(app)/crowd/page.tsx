'use client';

import { useIncidentStore } from '@/store/modules/incident';
import { LensPageLayout } from '@/components/operations/LensPageLayout';
import { Users, Eye, Zap, Flame } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SystemStatusLevel } from '@/types/common';
import { m } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

// Lightweight count-up number component for operational telemetry metrics
function AnimatedNumber({
  value,
  duration = 750,
  suffix = '',
  formatter,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  formatter?: (val: number) => string;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const end = value;
    if (end === 0) return;

    const startTime = performance.now();
    let animationFrameId: number;

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress * (2 - progress); // easeOutQuad
      const currentVal = Math.round(easedProgress * end);
      setCurrent(currentVal);
      if (progress < 1) animationFrameId = requestAnimationFrame(updateNumber);
    };

    animationFrameId = requestAnimationFrame(updateNumber);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  const formatted = formatter ? formatter(current) : current.toLocaleString();
  return <span className="tabular-nums font-bold">{formatted}{suffix}</span>;
}

// ── Sector telemetry constants ─────────────────────────────────────────────────

// Trend direction metadata per sector
const SECTOR_TRENDS = [
  { direction: 'up' as const, delta: 3 },
  { direction: 'stable' as const, delta: 0 },
  { direction: 'down' as const, delta: 2 },
  { direction: 'up' as const, delta: 5 },
  { direction: 'down' as const, delta: 4 },
  { direction: 'stable' as const, delta: 0 },
] as const;

// Premium chip style lookup per severity level
const STATUS_CHIP_STYLES: Record<SystemStatusLevel, string> = {
  operational:
    'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/50',
  degraded:
    'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800/50',
  critical:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50',
  offline:
    'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-950/20 dark:text-gray-400 dark:border-gray-800/30',
};

const STATUS_CHIP_LABELS: Record<SystemStatusLevel, string> = {
  operational: 'NORMAL',
  degraded: 'HIGH',
  critical: 'CRITICAL',
  offline: 'OFFLINE',
};

// ── Presentational sub-components ──────────────────────────────────────────────

/** Compact trend direction indicator (▲ up / ▼ down / → stable) with reduced weight */
function TrendIndicator({
  direction,
  delta,
}: {
  direction: 'up' | 'down' | 'stable';
  delta: number;
}) {
  if (direction === 'stable') {
    return (
      <span className="text-[7px] font-mono text-(--foreground-subtle)/60 leading-none">
        → Stable
      </span>
    );
  }
  const isUp = direction === 'up';
  return (
    <span
      className={cn(
        'text-[7px] font-mono leading-none opacity-75',
        isUp ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
      )}
    >
      {isUp ? '▲' : '▼'} {isUp ? '+' : '-'}{delta}%
    </span>
  );
}

// ── Page component ──────────────────────────────────────────────────────────────

export default function CrowdMonitoringPage() {
  const stadiumStats = useIncidentStore((state) => state.stadiumStats);
  const baseDensity = stadiumStats.crowdDensity;

  // Dynamically calculate capacity per zone scaled from the live global density telemetry
  const sectors = useMemo(() => {
    return [
      { id: 'z-north', name: 'North Stand', ratio: 1.25, type: 'General Admission' },
      { id: 'z-south', name: 'South Stand', ratio: 1.01, type: 'General Admission' },
      { id: 'z-east',  name: 'East Stand',  ratio: 0.93, type: 'Family / General' },
      { id: 'z-west',  name: 'West Stand',  ratio: 1.13, type: 'General Admission' },
      { id: 'z-vip',   name: 'VIP Lounge',  ratio: 0.79, type: 'Premium Suite' },
      { id: 'z-press', name: 'Press Box',   ratio: 0.60, type: 'Media Tribune' },
    ].map((sec, idx) => {
      const rawVal = Math.round(baseDensity * sec.ratio);
      const capacity = Math.min(100, Math.max(0, rawVal));

      let level: SystemStatusLevel = 'operational';
      if (capacity >= 85) level = 'critical';
      else if (capacity >= 70) level = 'degraded';

      return {
        ...sec,
        capacity,
        level,
        trend: SECTOR_TRENDS[idx],
      };
    });
  }, [baseDensity]);

  const getProgressColor = (level: SystemStatusLevel) =>
    ({
      operational: 'bg-(--color-success)',
      degraded:    'bg-(--color-warning)',
      critical:    'bg-(--color-error)',
      offline:     'bg-gray-400',
    })[level];

  // Border / background differentiated by severity; hover shadow added uniformly
  const getBgStyle = (level: SystemStatusLevel) =>
    ({
      operational:
        'bg-(--surface-2)/20 border-(--border)/60 opacity-90 shadow-2xs ' +
        'hover:opacity-100 hover:border-(--border-strong) hover:shadow-md ' +
        'dark:bg-gray-900/5 dark:border-gray-800/20 dark:hover:border-gray-700/40',
      degraded:
        'bg-yellow-500/[0.03] border-yellow-500/20 shadow-2xs ' +
        'hover:border-yellow-500/40 hover:shadow-md ' +
        'dark:bg-yellow-950/5 dark:border-yellow-900/10 dark:hover:border-yellow-800/35',
      critical:
        'bg-red-500/[0.04] border-red-500/30 shadow-sm shadow-red-500/5 ' +
        'hover:border-red-500/55 hover:shadow-md ' +
        'dark:bg-red-950/10 dark:border-red-900/20 dark:hover:border-red-800/50 dark:shadow-none',
      offline:
        'bg-gray-50/30 border-gray-100/50 dark:bg-gray-950/5 dark:border-gray-900/10',
    })[level];


  return (
    <LensPageLayout
      domain="crowd"
      title="Crowd Density & Flow Telemetry"
      description="Ingress flow rates, turnstile scanning speeds, and localized sector capacity limits"
      statusPills={[
        { label: 'CCTV FEEDS LINKED', level: 'operational' },
        { label: 'MONITORING',        level: 'operational' },
      ]}
      footerConsoleStatusText="CONSOLE STATUS: OPERATIONAL"
      incidentFilter={(i) => i.category === 'crowd'}
      metrics={
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* KPI — Ingress Index */}
          <div className="bg-(--surface-2)/45 border border-(--border) rounded-xl p-3 flex items-center gap-3 shadow-xs transition-all duration-150 hover:-translate-y-px hover:shadow-sm">
            <div className="w-8 h-8 rounded bg-(--primary-muted) text-(--primary) flex items-center justify-center shrink-0">
              <Users size={15} />
            </div>
            <div>
              <p className="text-[7.5px] font-mono font-semibold text-(--foreground-subtle) uppercase tracking-wider">
                Ingress Index
              </p>
              <p className="text-base font-bold font-mono tracking-tight mt-0.5">
                <AnimatedNumber value={baseDensity} suffix="%" />
              </p>
            </div>
          </div>

          {/* KPI — CCTV Feeds */}
          <div className="bg-(--surface-2)/45 border border-(--border) rounded-xl p-3 flex items-center gap-3 shadow-xs transition-all duration-150 hover:-translate-y-px hover:shadow-sm">
            <div className="w-8 h-8 rounded bg-blue-950/20 text-blue-500 flex items-center justify-center shrink-0">
              <Eye size={15} />
            </div>
            <div>
              <p className="text-[7.5px] font-mono font-semibold text-(--foreground-subtle) uppercase tracking-wider">
                CCTV Feeds
              </p>
              <p className="text-base font-bold font-mono tracking-tight mt-0.5">
                <AnimatedNumber value={148} />{' '}
                <span className="text-[9.5px] text-(--foreground-muted) font-normal font-sans">Online</span>
              </p>
            </div>
          </div>

          {/* KPI — Scan Speed */}
          <div className="bg-(--surface-2)/45 border border-(--border) rounded-xl p-3 flex items-center gap-3 shadow-xs transition-all duration-150 hover:-translate-y-px hover:shadow-sm">
            <div className="w-8 h-8 rounded bg-amber-950/20 text-amber-500 flex items-center justify-center shrink-0">
              <Zap size={15} />
            </div>
            <div>
              <p className="text-[7.5px] font-mono font-semibold text-(--foreground-subtle) uppercase tracking-wider">
                Scan Speed
              </p>
              <p className="text-base font-bold font-mono tracking-tight mt-0.5">
                <AnimatedNumber value={94} suffix="%" />{' '}
                <span className="text-[9.5px] text-(--foreground-muted) font-normal font-sans">Efficiency</span>
              </p>
            </div>
          </div>
        </div>
      }
      mainContent={
        <div className="border border-(--border) rounded-xl p-4 bg-(--surface-2)/20 h-full flex flex-col justify-between shadow-sm">
          <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider mb-3">
            Sector Saturation Map
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
            {sectors.map((sec, idx) => (
              <m.div
                key={sec.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.07 }}
                className={cn(
                  'group p-3.5 rounded-md border flex flex-col gap-2.5',
                  'transition-all duration-150 cursor-pointer hover:-translate-y-0.5',
                  getBgStyle(sec.level)
                )}
                role="region"
                aria-label={`${sec.name}: ${sec.capacity}% capacity, ${sec.level}`}
              >
                {/* Row 1: Sector name + type / Status chip + trend */}
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h4 className={cn(
                      'text-[11px] font-bold leading-tight',
                      sec.level === 'critical'
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-(--foreground)'
                    )}>
                      {sec.name}
                    </h4>
                    <p className="text-[8px] text-(--foreground-subtle) font-mono uppercase mt-0.5 tracking-wide">
                      {sec.type}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    {/* Premium status chip communicates severity at a glance */}
                    <span className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded border',
                      'text-[7.5px] font-mono font-bold uppercase tracking-wider',
                      STATUS_CHIP_STYLES[sec.level]
                    )}>
                      {STATUS_CHIP_LABELS[sec.level]}
                    </span>
                    {/* Trend direction complementing occupancy % */}
                    <TrendIndicator direction={sec.trend.direction} delta={sec.trend.delta} />
                  </div>
                </div>

                {/* Row 2: Progress bar with smooth eased fill on initial render */}
                <div className="w-full h-1.5 bg-(--surface-3) dark:bg-gray-800 rounded-full overflow-hidden">
                  <m.div
                    className={cn('h-full rounded-full', getProgressColor(sec.level))}
                    initial={{ width: 0 }}
                    animate={{ width: `${sec.capacity}%` }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>

                {/* Row 3: Clean operational capacity layout */}
                <div className="flex items-center justify-between text-[9.5px] font-mono">
                  <span className="font-bold text-(--foreground) tabular-nums">
                    <AnimatedNumber value={sec.capacity} suffix="% Full" />
                  </span>
                  <span className="text-(--foreground-muted) font-semibold tabular-nums">
                    <AnimatedNumber value={sec.capacity * 250} />{' '}
                    <span className="text-[8px] font-normal text-(--foreground-subtle)">/ 25,000</span>
                  </span>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      }
      alertContent={
        <div className="border border-(--border) bg-(--surface-2)/20 rounded-xl p-4 flex flex-col justify-between h-full shadow-sm">
          {/* Header */}
          <div className="flex items-start gap-3 pb-3 border-b border-(--border)">
            <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center shrink-0">
              <Flame size={16} className="text-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-(--foreground)">Tac-Route Redirection Active</h4>
                <span className="text-[8px] font-mono font-bold uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-(--foreground-muted) leading-relaxed mt-1">
                Redirection signage active on North Plaza screens. Spectators from VIP West
                dropoffs are routed towards Gate B to mitigate Gate 7 congestion.
              </p>
            </div>
          </div>

          {/* Operational Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
            <div className="bg-(--surface-1)/80 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Reason</span>
              <span className="text-[10.5px] font-bold text-(--foreground) mt-0.5 block truncate">Gate 7 Congestion</span>
            </div>
            <div className="bg-(--surface-1)/80 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Affected Stands</span>
              <span className="text-[10.5px] font-bold text-(--foreground) mt-0.5 block truncate">North, VIP West</span>
            </div>
            <div className="bg-(--surface-1)/80 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Redirected Flow</span>
              <span className="text-[10.5px] font-bold text-(--foreground) mt-0.5 block">
                <AnimatedNumber value={1200} />{' '}
                <span className="text-[8.5px] text-(--foreground-subtle) font-normal">Spectators</span>
              </span>
            </div>
            <div className="bg-(--surface-1)/80 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Compliance</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10.5px] font-bold text-(--foreground)">
                  <AnimatedNumber value={85} suffix="%" />
                </span>
                <div className="flex-1 h-1.5 bg-(--surface-3) dark:bg-gray-800 rounded-full overflow-hidden">
                  <m.div
                    className="h-full bg-amber-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 0.65, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
            <div className="bg-(--surface-1)/80 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Assigned Team</span>
              <span className="text-[10.5px] font-bold text-(--foreground) mt-0.5 block truncate">Transit Ops &amp; Vol-A</span>
            </div>
            <div className="bg-(--surface-1)/80 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">AI Confidence</span>
              <span className="text-[10.5px] font-bold text-(--foreground) mt-0.5 block">
                <AnimatedNumber value={94} suffix="%" />{' '}
                <span className="text-[8.5px] text-(--foreground-subtle) font-normal">Match</span>
              </span>
            </div>
          </div>

          {/* Verification Timeline */}
          <div className="bg-(--surface-1)/40 border border-(--border)/50 rounded-lg p-3 my-2 text-left">
            <span className="block text-[7.5px] text-(--foreground-subtle) font-mono uppercase tracking-wider mb-3.5">
              Verification Timeline
            </span>

            <div className="relative pl-5 space-y-5">
              {/* Vertical connector — 1.5px for stronger visual presence */}
              <div className="absolute left-1 top-1.5 bottom-1.5 w-[1.5px] bg-(--border) dark:bg-gray-800" />

              {/* Completed step */}
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-amber-500 shrink-0" />
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-[8px] text-(--foreground-subtle) shrink-0">22:07:45 UTC</span>
                  <span className="text-[9.5px] text-(--foreground-muted) font-semibold truncate">Redirection templates verified</span>
                </div>
                <span className="text-[7.5px] font-mono text-green-700 dark:text-green-400 font-bold bg-green-500/10 border border-green-500/25 px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
                  COMPLETED
                </span>
              </div>

              {/* Running step */}
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-background border-2 border-amber-500 ring-2 ring-amber-500/20 shrink-0" />
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-[8px] text-(--foreground-subtle) shrink-0">22:08:12 UTC</span>
                  <span className="text-[9.5px] text-(--foreground-muted) font-semibold truncate">Active routing signage at Gate B</span>
                </div>
                <span className="text-[7.5px] font-mono text-amber-700 dark:text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider animate-pulse">
                  RUNNING
                </span>
              </div>

              {/* Pending step */}
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-background border-2 border-(--border-strong) shrink-0" />
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-[8px] text-(--foreground-subtle) shrink-0">22:15:00 UTC</span>
                  <span className="text-[9.5px] text-(--foreground-subtle) truncate">Planned manual compliance sweep</span>
                </div>
                <span className="text-[7.5px] font-mono text-(--foreground-subtle) bg-(--surface-2) border border-(--border)/70 px-1.5 py-0.5 rounded shrink-0 opacity-60 uppercase tracking-wider">
                  PENDING
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-(--border) flex items-center justify-between text-[8.5px] font-mono text-(--foreground-subtle)">
            <span>Activated: 22:07:45 UTC</span>
            <span>Target completion: End of Ingress</span>
          </div>
        </div>
      }
    />
  );
}
