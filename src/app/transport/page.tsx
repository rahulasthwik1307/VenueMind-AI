'use client';

import { useIncidentStore } from '@/store/modules/incident';
import { LensPageLayout } from '@/components/operations/LensPageLayout';
import { Bus, Train, Car, Navigation, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SystemStatusLevel } from '@/types/common';
import { m } from 'framer-motion';
import { useEffect, useState } from 'react';

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

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber);
      }
    };

    animationFrameId = requestAnimationFrame(updateNumber);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  const formatted = formatter ? formatter(current) : current.toLocaleString();
  return <span className="tabular-nums font-bold">{formatted}{suffix}</span>;
}

export default function TransportPage() {
  const stadiumStats = useIncidentStore((s) => s.stadiumStats);
  const transportStatus = stadiumStats.transportStatus; // 'Good' | 'Delayed' | 'Congested' | 'Critical'

  // Map global transport status to specific telemetry properties
  const isNormal = transportStatus === 'Good';
  const isCritical = transportStatus === 'Critical';

  const metroLevel: SystemStatusLevel = isNormal ? 'operational' : isCritical ? 'critical' : 'degraded';
  const shuttleLevel: SystemStatusLevel = isNormal ? 'operational' : 'degraded'; // Shuttle Bus Loop B bottlenecked

  // Define transport nodes
  const nodes = [
    {
      id: 'node-metro',
      name: 'Metro East Station',
      type: 'Rail Transit',
      icon: Train,
      level: metroLevel,
      saturation: isNormal ? 34 : isCritical ? 98 : transportStatus === 'Congested' ? 88 : 74,
      waitTime: isNormal ? '4m' : isCritical ? '35m' : transportStatus === 'Congested' ? '22m' : '12m',
      detail: 'Platform 1 & 2 loading. Direct high-frequency corridor to City Center.',
    },
    {
      id: 'node-shuttle-a',
      name: 'Shuttle Bus Loop A (North Gate)',
      type: 'Shuttle Bus',
      icon: Bus,
      level: 'operational' as const,
      saturation: 42,
      waitTime: '5m',
      detail: 'Express corridor to Fan Zone North. 12 active double-decker coaches.',
    },
    {
      id: 'node-shuttle-b',
      name: 'Shuttle Bus Loop B (South Gate)',
      type: 'Shuttle Bus',
      icon: Bus,
      level: shuttleLevel,
      saturation: isNormal ? 55 : 82,
      waitTime: isNormal ? '6m' : '15m',
      detail: 'Periodic delays due to external congestion bottleneck at Al Khor intersection.',
    },
    {
      id: 'node-ride-share',
      name: 'Taxi & Ride-Share Hub',
      type: 'Logistics Rank',
      icon: Car,
      level: 'operational' as const,
      saturation: 48,
      waitTime: '8m',
      detail: 'Designated passenger boarding bays 1-12 active. Flow remains steady.',
    },
  ];

  const getBadgeStyle = (level: SystemStatusLevel) => {
    const styles = {
      operational: 'text-green-700 bg-green-50 border-green-100 dark:text-green-400 dark:bg-green-950/20 dark:border-green-900/40',
      degraded: 'text-yellow-700 bg-yellow-50 border-yellow-100 dark:text-yellow-400 dark:bg-yellow-950/20 dark:border-yellow-900/40',
      critical: 'text-red-700 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-950/20 dark:border-red-900/40',
      offline: 'text-gray-500 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/20 dark:border-gray-800/30',
    };
    return styles[level];
  };

  const getMeterColor = (level: SystemStatusLevel) => {
    const styles = {
      operational: 'bg-(--color-success)',
      degraded: 'bg-(--color-warning)',
      critical: 'bg-(--color-error)',
      offline: 'bg-gray-400',
    };
    return styles[level];
  };

  const alertContent = !isNormal ? (
    <div className="border border-red-900/20 bg-red-950/5 dark:border-red-900/30 dark:bg-red-950/10 rounded-xl p-4 flex flex-col justify-between h-full shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 pb-3 border-b border-(--border)">
        <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center shrink-0">
          <AlertCircle size={16} className="text-red-500 animate-pulse" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-red-600 dark:text-red-400">Transit Delays Reported</h4>
            <span className="text-[8px] font-mono font-bold uppercase bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/25 px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <p className="text-[10px] text-(--foreground-muted) leading-relaxed mt-1">
            Al Khor Highway collision has restricted shuttle corridor B flow. Passengers waiting at Metro Hub B should be directed to the pedestrian walkways or Shuttle Route A.
          </p>
        </div>
      </div>

      {/* Operational Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Incident Cause</span>
          <span className="text-[10.5px] font-bold text-(--foreground) mt-0.5 block truncate">Traffic Collision</span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Affected Routes</span>
          <span className="text-[10.5px] font-bold text-(--foreground) mt-0.5 block truncate">Shuttle Route B</span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Est. Delay Increase</span>
          <span className="text-[10.5px] font-bold text-red-600 dark:text-red-400 mt-0.5 block">
            <AnimatedNumber value={25} suffix="m" />
          </span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Passenger Impact</span>
          <span className="text-[10.5px] font-bold text-(--foreground) mt-0.5 block">
            <AnimatedNumber value={1500} /> <span className="text-[8px] text-(--foreground-subtle) font-normal">Pax</span>
          </span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Assigned Team</span>
          <span className="text-[10.5px] font-bold text-(--foreground) mt-0.5 block truncate">Transit Ops &amp; TIRT</span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">AI Confidence</span>
          <span className="text-[10.5px] font-bold text-(--foreground) mt-0.5 block">
            <AnimatedNumber value={92} suffix="%" /> <span className="text-[8px] text-(--foreground-subtle) font-normal">Match</span>
          </span>
        </div>
      </div>

      {/* Connected Timeline */}
      <div className="bg-(--surface-1)/40 border border-(--border)/50 rounded-lg p-3 my-2 text-left">
        <span className="block text-[7.5px] text-(--foreground-subtle) font-mono uppercase tracking-wider mb-3.5">
          Incident Response Timeline
        </span>

        <div className="relative pl-5 space-y-4">
          <div className="absolute left-1 top-1.5 bottom-1.5 w-[1.5px] bg-(--border) dark:bg-gray-800" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-red-500 shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) shrink-0">08:12 UTC</span>
              <span className="text-[9.5px] text-(--foreground-muted) font-semibold truncate">Collision reported on Al Khor Hwy</span>
            </div>
            <span className="text-[7.5px] font-mono text-green-700 dark:text-green-400 font-bold bg-green-500/10 border border-green-500/25 px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
              COMPLETED
            </span>
          </div>

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-red-500 shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) shrink-0">08:15 UTC</span>
              <span className="text-[9.5px] text-(--foreground-muted) font-semibold truncate">Route B shuttle diversion recommended</span>
            </div>
            <span className="text-[7.5px] font-mono text-green-700 dark:text-green-400 font-bold bg-green-500/10 border border-green-500/25 px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
              COMPLETED
            </span>
          </div>

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-background border-2 border-red-500 ring-2 ring-red-500/20 shrink-0 animate-pulse" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) shrink-0">08:18 UTC</span>
              <span className="text-[9.5px] text-(--foreground-muted) font-semibold truncate">Redirect passengers to Walkway / Shuttle A</span>
            </div>
            <span className="text-[7.5px] font-mono text-red-700 dark:text-red-400 font-bold bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider animate-pulse">
              RUNNING
            </span>
          </div>

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-background border-2 border-(--border-strong) shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) shrink-0">08:35 UTC</span>
              <span className="text-[9.5px] text-(--foreground-subtle) truncate">Accident site cleared & lanes reopened</span>
            </div>
            <span className="text-[7.5px] font-mono text-(--foreground-subtle) bg-(--surface-2) border border-(--border)/70 px-1.5 py-0.5 rounded shrink-0 opacity-60 uppercase tracking-wider">
              PENDING
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-(--border) flex items-center justify-between text-[8.5px] font-mono text-(--foreground-subtle)">
        <span>Incident Registered: 08:12 UTC</span>
        <span>Est. Recovery: 30 min</span>
      </div>
    </div>
  ) : (
    <div className="border border-green-900/20 bg-green-950/5 rounded-xl p-4 flex flex-col justify-between h-full shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-3 pb-3 border-b border-(--border)">
        <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center shrink-0">
          <CheckCircle size={16} className="text-green-500" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-green-600 dark:text-green-400">All Transit Operations Nominal</h4>
            <span className="text-[8px] font-mono font-bold uppercase bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/25 px-1.5 py-0.5 rounded">
              Nominal
            </span>
          </div>
          <p className="text-[10px] text-(--foreground-muted) leading-relaxed mt-1">
            Metro transit and shuttle routes are operating within normal capacity and headway targets. No bypasses or redirections active.
          </p>
        </div>
      </div>

      {/* Operational Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Transit Fleet</span>
          <span className="text-[10.5px] font-bold text-green-600 dark:text-green-400 mt-0.5 block truncate">100% Active</span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Bypass Routes</span>
          <span className="text-[10.5px] font-bold text-(--foreground) mt-0.5 block truncate">Standby Mode</span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Headway Target</span>
          <span className="text-[10.5px] font-bold text-(--foreground) mt-0.5 flex items-center gap-0.5">
            <AnimatedNumber value={5} suffix="m avg" />
          </span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Station Density</span>
          <span className="text-[10.5px] font-bold text-(--foreground) mt-0.5 block">
            <AnimatedNumber value={28} suffix="%" /> <span className="text-[8px] text-(--foreground-subtle) font-normal">Cap</span>
          </span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Active Dispatchers</span>
          <span className="text-[10.5px] font-bold text-(--foreground) mt-0.5 block truncate">
            <AnimatedNumber value={42} /> Staff
          </span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">AI System Monitor</span>
          <span className="text-[10.5px] font-bold text-(--primary) mt-0.5 block truncate">Auditing Feeds</span>
        </div>
      </div>

      {/* Operational Timeline */}
      <div className="bg-(--surface-1)/40 border border-(--border)/50 rounded-lg p-3 my-2 text-left">
        <span className="block text-[7.5px] text-(--foreground-subtle) font-mono uppercase tracking-wider mb-3.5">
          Operational Benchmarks
        </span>

        <div className="relative pl-5 space-y-4">
          <div className="absolute left-1 top-1.5 bottom-1.5 w-[1.5px] bg-(--border) dark:bg-gray-800" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-green-500 shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) shrink-0">06:00 UTC</span>
              <span className="text-[9.5px] text-(--foreground-muted) font-semibold truncate">Fleet rollout & station health audits complete</span>
            </div>
            <span className="text-[7.5px] font-mono text-green-700 dark:text-green-400 font-bold bg-green-500/10 border border-green-500/25 px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
              COMPLETED
            </span>
          </div>

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-green-500 shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) shrink-0">07:30 UTC</span>
              <span className="text-[9.5px] text-(--foreground-muted) font-semibold truncate">Peak match ingress telemetry synchronized</span>
            </div>
            <span className="text-[7.5px] font-mono text-green-700 dark:text-green-400 font-bold bg-green-500/10 border border-green-500/25 px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
              COMPLETED
            </span>
          </div>

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-background border-2 border-green-500 ring-2 ring-green-500/20 shrink-0 animate-pulse" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) shrink-0">08:00 UTC</span>
              <span className="text-[9.5px] text-(--foreground-muted) font-semibold truncate">Real-time GPS tracking & scheduling active</span>
            </div>
            <span className="text-[7.5px] font-mono text-green-700 dark:text-green-400 font-bold bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider animate-pulse">
              RUNNING
            </span>
          </div>

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-background border-2 border-(--border-strong) shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) shrink-0">09:15 UTC</span>
              <span className="text-[9.5px] text-(--foreground-subtle) truncate">Scheduled match-end egress mobilization</span>
            </div>
            <span className="text-[7.5px] font-mono text-(--foreground-subtle) bg-(--surface-2) border border-(--border)/70 px-1.5 py-0.5 rounded shrink-0 opacity-60 uppercase tracking-wider">
              PENDING
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-(--border) flex items-center justify-between text-[8.5px] font-mono text-(--foreground-subtle)">
        <span>Active Session: nominal</span>
        <span>Interval Standard: 5 min</span>
      </div>
    </div>
  );

  return (
    <LensPageLayout
      domain="transport"
      title="Transit & Shuttle Telemetry Console"
      description="Monitoring metro lines, shuttle bus routes, external junctions delays, and VIP dropoff rates"
      statusPills={[
        { label: 'GPS FEED ONLINE', level: 'operational' },
        { label: `${nodes.length} HUBS ACTIVE`, level: 'operational' },
      ]}
      footerConsoleStatusText="CONSOLE STATUS: STABLE"
      incidentFilter={(i) => i.category === 'transport'}
      metrics={
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* KPI 1: Transit Load */}
          <div className="bg-(--surface-2)/45 border border-(--border) rounded-xl p-3 flex items-center gap-3 shadow-xs transition-all duration-150 hover:-translate-y-px hover:shadow-sm">
            <div className="w-8 h-8 rounded bg-(--primary-muted) text-(--primary) flex items-center justify-center shrink-0">
              <Bus size={15} />
            </div>
            <div>
              <p className="text-[7.5px] font-mono font-semibold text-(--foreground-subtle) uppercase tracking-wider">Transit Load</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-base font-bold font-mono tracking-tight">
                  <AnimatedNumber value={isNormal ? 44 : isCritical ? 90 : 82} suffix="%" />
                </p>
                <span className={cn('text-[8px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0 font-mono tracking-wider', isNormal ? 'text-green-700 bg-green-50 border border-green-100 dark:text-green-400 dark:bg-green-950/20 dark:border-green-900/40' : 'text-red-700 bg-red-50 border border-red-100 dark:text-red-400 dark:bg-red-950/20 dark:border-red-900/40')}>
                  {transportStatus}
                </span>
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', isNormal ? 'bg-green-400' : 'bg-red-400')} />
                  <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', isNormal ? 'bg-green-500' : 'bg-red-500')} />
                </span>
              </div>
            </div>
          </div>

          {/* KPI 2: Active Bypasses */}
          <div className="bg-(--surface-2)/45 border border-(--border) rounded-xl p-3 flex items-center gap-3 shadow-xs transition-all duration-150 hover:-translate-y-px hover:shadow-sm">
            <div className="w-8 h-8 rounded bg-blue-950/20 text-blue-500 flex items-center justify-center shrink-0">
              <Navigation size={15} />
            </div>
            <div>
              <p className="text-[7.5px] font-mono font-semibold text-(--foreground-subtle) uppercase tracking-wider">Active Bypasses</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-base font-bold font-mono tracking-tight">
                  <AnimatedNumber value={isNormal ? 0 : 1} />
                </p>
                <span className="text-[9.5px] text-(--foreground-muted) font-normal font-sans">
                  {isNormal ? 'None (Standby)' : 'Route C Active'}
                </span>
              </div>
            </div>
          </div>

          {/* KPI 3: Sector Alert Index */}
          <div className="bg-(--surface-2)/45 border border-(--border) rounded-xl p-3 flex items-center gap-3 shadow-xs transition-all duration-150 hover:-translate-y-px hover:shadow-sm">
            <div className="w-8 h-8 rounded bg-amber-950/20 text-amber-500 flex items-center justify-center shrink-0">
              <AlertCircle size={15} />
            </div>
            <div>
              <p className="text-[7.5px] font-mono font-semibold text-(--foreground-subtle) uppercase tracking-wider">Sector Alert Index</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-base font-bold font-mono tracking-tight">
                  <AnimatedNumber value={isNormal ? 10 : isCritical ? 95 : 75} suffix="%" />
                </p>
                <span className={cn('text-[8px] font-bold px-1.5 py-0.2 rounded uppercase shrink-0 font-mono tracking-wider', isNormal ? 'text-green-700 bg-green-50 border border-green-100 dark:text-green-400 dark:bg-green-950/20 dark:border-green-900/40' : 'text-amber-700 bg-amber-50 border border-amber-100 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/40')}>
                  {isNormal ? 'Nominal' : isCritical ? 'Critical' : 'Alert'}
                </span>
              </div>
            </div>
          </div>
        </div>
      }
      mainContent={
        <div className="border border-(--border) rounded-xl p-4 bg-(--surface-2)/20 space-y-3.5 h-full flex flex-col justify-between shadow-sm">
          <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider shrink-0">
            Transit Node Monitor
          </h3>
          
          <div className="space-y-3 flex-1 overflow-y-auto min-h-0 custom-scrollbar-always pr-0.5" role="list">
            {nodes.map((node, idx) => {
              const NodeIcon = node.icon;
              // Extract numeric wait time
              const waitNumeric = parseInt(node.waitTime, 10);
              const hasSuffix = node.waitTime.includes('m');

              return (
                <m.div
                  key={node.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.07 }}
                  className={cn(
                    'bg-(--surface-1) border border-(--border) rounded-md p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs',
                    'transition-all duration-150 cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-(--border-strong)'
                  )}
                  role="listitem"
                  aria-label={`${node.name}: ${node.type}, status ${node.level}`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded bg-(--surface-2) border border-(--border) flex items-center justify-center shrink-0 text-(--foreground-muted) group-hover:bg-(--surface-3) transition-colors">
                      <NodeIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-[11.5px] font-bold text-(--foreground) truncate leading-tight">{node.name}</h4>
                        <span className="text-[7.5px] text-(--foreground-subtle) font-mono uppercase bg-(--surface-2) px-1.5 py-0.5 rounded border border-(--border)">
                          {node.type}
                        </span>
                      </div>
                      <p className="text-[10px] text-(--foreground-muted) mt-1 leading-normal">
                        {node.detail}
                      </p>
                    </div>
                  </div>

                  {/* Saturation, wait time, level tag */}
                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                    <div className="text-right">
                      <p className="text-[7.5px] font-mono font-semibold text-(--foreground-subtle) uppercase tracking-wider">Saturation</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-16 h-1.5 bg-(--surface-3) dark:bg-gray-800 rounded-full overflow-hidden">
                          <m.div
                            className={cn('h-full rounded-full transition-all', getMeterColor(node.level))}
                            initial={{ width: 0 }}
                            animate={{ width: `${node.saturation}%` }}
                            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                          />
                        </div>
                        <span className="text-[10.5px] font-mono font-bold text-(--foreground) tabular-nums">
                          <AnimatedNumber value={node.saturation} suffix="%" />
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[7.5px] font-mono font-semibold text-(--foreground-subtle) uppercase tracking-wider">Avg Wait</p>
                      <p className="text-xs font-mono font-bold text-(--foreground) mt-0.5">
                        <AnimatedNumber value={waitNumeric} suffix={hasSuffix ? 'm' : ''} />
                      </p>
                    </div>

                    <span className={cn('text-[7.5px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border shrink-0 tracking-wider', getBadgeStyle(node.level))}>
                      {node.level === 'operational' ? 'Normal' : node.level === 'degraded' ? 'Delayed' : 'Critical'}
                    </span>
                  </div>
                </m.div>
              );
            })}
          </div>
        </div>
      }
      alertContent={alertContent}
    />
  );
}
