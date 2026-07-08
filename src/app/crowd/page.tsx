'use client';

import { useIncidentStore } from '@/store/modules/incident';
import { LensPageLayout } from '@/components/operations/LensPageLayout';
import { Users, Eye, Zap, Flame } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SystemStatusLevel } from '@/types/common';

export default function CrowdMonitoringPage() {
  const { stadiumStats } = useIncidentStore();
  const baseDensity = stadiumStats.crowdDensity;

  // Dynamically calculate capacity per zone scaled from the live global density telemetry
  const sectors = [
    { id: 'z-north', name: 'North Stand', ratio: 1.25, type: 'General Admission' },
    { id: 'z-south', name: 'South Stand', ratio: 1.01, type: 'General Admission' },
    { id: 'z-east', name: 'East Stand', ratio: 0.93, type: 'Family / General' },
    { id: 'z-west', name: 'West Stand', ratio: 1.13, type: 'General Admission' },
    { id: 'z-vip', name: 'VIP Lounge', ratio: 0.79, type: 'Premium Suite' },
    { id: 'z-press', name: 'Press Box', ratio: 0.60, type: 'Media Tribune' },
  ].map((sec) => {
    const rawVal = Math.round(baseDensity * sec.ratio);
    const capacity = Math.min(100, Math.max(0, rawVal));
    
    let level: SystemStatusLevel = 'operational';
    if (capacity >= 85) level = 'critical';
    else if (capacity >= 70) level = 'degraded';

    return {
      ...sec,
      capacity,
      level,
    };
  });

  const getProgressColor = (level: SystemStatusLevel) => {
    const styles = {
      operational: 'bg-(--color-success)',
      degraded: 'bg-(--color-warning)',
      critical: 'bg-(--color-error)',
      offline: 'bg-gray-400',
    };
    return styles[level];
  };

  const getBgStyle = (level: SystemStatusLevel) => {
    const styles = {
      operational: 'bg-green-50/30 border-green-100/50 dark:bg-green-950/5 dark:border-green-900/10',
      degraded: 'bg-yellow-50/30 border-yellow-100/50 dark:bg-yellow-950/5 dark:border-yellow-900/10',
      critical: 'bg-red-50/30 border-red-100/50 dark:bg-red-950/5 dark:border-red-900/10',
      offline: 'bg-gray-50/30 border-gray-100/50 dark:bg-gray-950/5 dark:border-gray-900/10',
    };
    return styles[level];
  };

  const getTextStyle = (level: SystemStatusLevel) => {
    const styles = {
      operational: 'text-green-700 dark:text-green-400',
      degraded: 'text-yellow-700 dark:text-yellow-400',
      critical: 'text-red-700 dark:text-red-400',
      offline: 'text-gray-500',
    };
    return styles[level];
  };

  return (
    <LensPageLayout
      domain="crowd"
      title="Crowd Density & Flow Telemetry"
      description="Ingress flow rates, turnstile scanning speeds, and localized sector capacity limits"
      statusPills={[
        { label: 'CCTV FEEDS LINKED', level: 'operational' },
        { label: 'MONITORING', level: 'operational' },
      ]}
      footerConsoleStatusText="CONSOLE STATUS: OPERATIONAL"
      incidentFilter={(i) => i.category === 'crowd'}
    >
      <div className="space-y-6 pr-0 lg:pr-2">
        {/* Overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-(--surface-2)/40 border border-(--border) rounded-md p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-(--primary-muted) text-(--primary) flex items-center justify-center shrink-0">
              <Users size={15} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold text-(--foreground-subtle) uppercase">Ingress Index</p>
              <p className="text-base font-bold font-mono tracking-tight mt-0.5">{baseDensity}%</p>
            </div>
          </div>
          
          <div className="bg-(--surface-2)/40 border border-(--border) rounded-md p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-950/20 text-blue-500 flex items-center justify-center shrink-0">
              <Eye size={15} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold text-(--foreground-subtle) uppercase">CCTV Feeds</p>
              <p className="text-base font-bold font-mono tracking-tight mt-0.5">148 Online</p>
            </div>
          </div>

          <div className="bg-(--surface-2)/40 border border-(--border) rounded-md p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-950/20 text-amber-500 flex items-center justify-center shrink-0">
              <Zap size={15} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold text-(--foreground-subtle) uppercase">Scan Speed</p>
              <p className="text-base font-bold font-mono tracking-tight mt-0.5">94% Efficiency</p>
            </div>
          </div>
        </div>

        {/* Sectors list */}
        <div className="border border-(--border) rounded-xl p-4 bg-(--surface-2)/20">
          <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider mb-3">
            Sector Saturation Map
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {sectors.map((sec) => (
              <div
                key={sec.id}
                className={cn(
                  'p-3.5 rounded-md border transition-all duration-200',
                  getBgStyle(sec.level)
                )}
                role="region"
                aria-label={`${sec.name}: ${sec.capacity}% capacity, ${sec.level}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-(--foreground)">{sec.name}</h4>
                    <p className="text-[9px] text-(--foreground-subtle) font-mono uppercase mt-0.5">{sec.type}</p>
                  </div>
                  <span className={cn('text-[9px] font-mono font-bold uppercase tracking-wider', getTextStyle(sec.level))}>
                    {sec.level === 'operational' ? 'Normal' : sec.level === 'degraded' ? 'High' : 'Critical'}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-(--surface-3) dark:bg-gray-800 rounded-full overflow-hidden mb-1">
                  <div
                    className={cn('h-full rounded-full transition-all duration-500', getProgressColor(sec.level))}
                    style={{ width: `${sec.capacity}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-[10px] font-semibold text-(--foreground-muted) font-mono">
                  <span>{sec.capacity}% full</span>
                  <span className="tabular-nums">{(sec.capacity * 250).toLocaleString()} / 25,000 spectators</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tactical alerts banner */}
        <div className="border border-amber-900/30 bg-amber-950/10 rounded-md p-3.5 flex items-start gap-3">
          <Flame size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-400">Tac-Route Redirection Active</h4>
            <p className="text-[10px] text-amber-200/80 leading-relaxed mt-0.5">
              Redirection signage active on North Plaza screens. Spectators from VIP West dropoffs are routed towards Gate B to mitigate Gate 7 sags.
            </p>
          </div>
        </div>
      </div>
    </LensPageLayout>
  );
}
