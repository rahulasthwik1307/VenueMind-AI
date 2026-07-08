'use client';

import { useIncidentStore } from '@/store/modules/incident';
import { LensPageLayout } from '@/components/operations/LensPageLayout';
import { Bus, Train, Car, Navigation, AlertCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SystemStatusLevel } from '@/types/common';

export default function TransportPage() {
  const { stadiumStats } = useIncidentStore();
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
      offline: 'text-gray-500 bg-gray-50 border-gray-200',
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
    >
      <div className="space-y-6 pr-0 lg:pr-2">
        {/* Metric widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-(--surface-2)/40 border border-(--border) rounded-md p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-(--primary-muted) text-(--primary) flex items-center justify-center shrink-0">
              <Bus size={15} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold text-(--foreground-subtle) uppercase">Transit Status</p>
              <p className="text-sm font-bold font-mono tracking-tight mt-0.5">{transportStatus}</p>
            </div>
          </div>

          <div className="bg-(--surface-2)/40 border border-(--border) rounded-md p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-blue-950/20 text-blue-500 flex items-center justify-center shrink-0">
              <Navigation size={15} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold text-(--foreground-subtle) uppercase">Bypass Active</p>
              <p className="text-sm font-bold font-mono tracking-tight mt-0.5">Route C Active</p>
            </div>
          </div>

          <div className="bg-(--surface-2)/40 border border-(--border) rounded-md p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-amber-950/20 text-amber-500 flex items-center justify-center shrink-0">
              <AlertCircle size={15} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold text-(--foreground-subtle) uppercase">Alert Level</p>
              <p className="text-sm font-bold font-mono tracking-tight mt-0.5">
                {isNormal ? 'Nominal' : isCritical ? 'Critical' : 'Alert'}
              </p>
            </div>
          </div>
        </div>

        {/* Transport Hub Status Cards */}
        <div className="border border-(--border) rounded-xl p-4 bg-(--surface-2)/20 space-y-3.5">
          <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider">
            Transit Node Monitor
          </h3>
          
          <div className="space-y-3">
            {nodes.map((node) => {
              const NodeIcon = node.icon;
              return (
                <div
                  key={node.id}
                  className="bg-(--surface-1) border border-(--border) rounded-md p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  role="region"
                  aria-label={`${node.name}: ${node.type}, status ${node.level}`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded bg-(--surface-2) border border-(--border) flex items-center justify-center shrink-0 text-(--foreground-muted)">
                      <NodeIcon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-(--foreground) truncate">{node.name}</h4>
                        <span className="text-[9px] text-(--foreground-subtle) font-mono uppercase bg-(--surface-2) px-1 rounded">
                          {node.type}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-(--foreground-muted) mt-1 leading-normal">
                        {node.detail}
                      </p>
                    </div>
                  </div>

                  {/* Saturation, wait time, level tag */}
                  <div className="flex items-center gap-4 shrink-0 justify-between md:justify-end">
                    <div className="text-right">
                      <p className="text-[9px] font-mono font-semibold text-(--foreground-subtle) uppercase">Saturation</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-16 h-1.5 bg-(--surface-3) rounded-full overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all', getMeterColor(node.level))}
                            style={{ width: `${node.saturation}%` }}
                          />
                        </div>
                        <span className="text-[10.5px] font-mono font-bold text-(--foreground) tabular-nums">
                          {node.saturation}%
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] font-mono font-semibold text-(--foreground-subtle) uppercase">Avg Wait</p>
                      <p className="text-xs font-mono font-bold text-(--foreground) mt-0.5">{node.waitTime}</p>
                    </div>

                    <span className={cn('text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border shrink-0 font-mono tracking-wide', getBadgeStyle(node.level))}>
                      {node.level === 'operational' ? 'Normal' : node.level === 'degraded' ? 'Delayed' : 'Critical'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transport Alert */}
        {!isNormal && (
          <div className="border border-red-900/30 bg-red-950/10 rounded-md p-3.5 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-red-600 dark:text-red-400">Transit Delays Reported</h4>
              <p className="text-[10px] text-red-700 dark:text-red-300 leading-relaxed mt-0.5">
                Al Khor Highway collision has restricted shuttle corridor B flow. Passengers waiting at Metro Hub B should be directed to the pedestrian walkways or Shuttle Route A.
              </p>
            </div>
          </div>
        )}
      </div>
    </LensPageLayout>
  );
}
