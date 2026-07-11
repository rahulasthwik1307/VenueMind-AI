'use client';

import { Activity, Wifi } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import type { Incident } from '@/types/incident';
import type { AssistantDomain } from '@/types/assistant';

interface DomainTelemetryStatusProps {
  domain: AssistantDomain;
  filteredIncidents: Incident[];
}

export function DomainTelemetryStatus({ domain, filteredIncidents }: DomainTelemetryStatusProps) {
  return (
    <div className="mt-4 pt-3 border-t border-(--border) space-y-2.5 shrink-0 text-left">
      <div className="flex items-center justify-between text-[7.5px] font-mono text-(--foreground-subtle) uppercase tracking-wider">
        <span>Operational Telemetry</span>
        <span className="text-(--color-success) flex items-center gap-1 font-bold">
          <span className="w-1 h-1 rounded-full bg-(--color-success) live-indicator" />
          Feeds Active
        </span>
      </div>
      
      {domain === 'transport' ? (
        <>
          {/* Transport-Specific Telemetry */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-(--surface-1)/75 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Monitored Hubs</span>
              <span className="text-[11px] font-extrabold text-(--foreground) mt-0.5 block">4 Active Nodes</span>
            </div>
            <div className="bg-(--surface-1)/75 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Dispatch Status</span>
              <span className="text-[11px] font-extrabold text-(--foreground) mt-0.5 flex items-center gap-0.5">
                <AnimatedNumber value={96} suffix="%" /> <span className="text-[8.5px] text-(--foreground-subtle) font-normal">On-Time</span>
              </span>
            </div>
          </div>

          {/* Transport-Specific Activity Logs */}
          <div className="space-y-1.5">
            <span className="block text-[7.5px] font-mono text-(--foreground-subtle) uppercase tracking-wider">Recent Activity Logs</span>
            <div className="text-[9.5px] space-y-2 text-(--foreground-muted) font-sans">
              <div className="flex items-center gap-2 border-l-2 border-(--primary)/25 pl-2 py-0.5">
                <Activity size={11} className="text-(--primary) shrink-0" />
                <span className="truncate leading-snug">Shuttle Route B: <span className="font-semibold text-(--foreground)">Diversion active</span> (Collision reroute)</span>
              </div>
              <div className="flex items-center gap-2 border-l-2 border-blue-500/25 pl-2 py-0.5">
                <Wifi size={11} className="text-blue-500 shrink-0" />
                <span className="truncate leading-snug">Metro Platform 2: <span className="font-semibold text-(--foreground)">Flow normalized</span> (Egress target met)</span>
              </div>
            </div>
          </div>
        </>
      ) : domain === 'emergency' ? (
        <>
          {/* Emergency-Specific Telemetry */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-(--surface-1)/75 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Response Readiness</span>
              <span className="text-[11px] font-extrabold text-(--foreground) mt-0.5 flex items-center gap-0.5">
                <AnimatedNumber value={98} suffix="%" /> <span className="text-[8.5px] text-(--foreground-subtle) font-normal">Ready</span>
              </span>
            </div>
            <div className="bg-(--surface-1)/75 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Active Responders</span>
              <span className="text-[11px] font-extrabold text-(--foreground) mt-0.5 block">240 Staff</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="block text-[7.5px] font-mono text-(--foreground-subtle) uppercase tracking-wider">Recent Activity Logs</span>
            <div className="text-[9.5px] space-y-2 text-(--foreground-muted) font-sans">
              <div className="flex items-center gap-2 border-l-2 border-(--primary)/25 pl-2 py-0.5">
                <Activity size={11} className="text-(--primary) shrink-0" />
                <span className="truncate leading-snug">Gate 3 Security Perimeter: <span className="font-semibold text-(--foreground)">Lock confirmed</span> (Auxiliary relay active)</span>
              </div>
              <div className="flex items-center gap-2 border-l-2 border-blue-500/25 pl-2 py-0.5">
                <Wifi size={11} className="text-blue-500 shrink-0" />
                <span className="truncate leading-snug">Medical Unit 4 Dispatch: <span className="font-semibold text-(--foreground)">Response time 2.1m</span> (Nominal)</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Crowd-Specific Telemetry */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-(--surface-1)/75 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Monitored Sectors</span>
              <span className="text-[11px] font-extrabold text-(--foreground) mt-0.5 block">6 Active Stands</span>
            </div>
            <div className="bg-(--surface-1)/75 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Scanner Speed</span>
              <span className="text-[11px] font-extrabold text-(--foreground) mt-0.5 flex items-center gap-0.5">
                <AnimatedNumber value={94} suffix="%" /> <span className="text-[8.5px] text-(--foreground-subtle) font-normal">Efficiency</span>
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="block text-[7.5px] font-mono text-(--foreground-subtle) uppercase tracking-wider">Recent Activity Logs</span>
            <div className="text-[9.5px] space-y-2 text-(--foreground-muted) font-sans">
              <div className="flex items-center gap-2 border-l-2 border-(--primary)/25 pl-2 py-0.5">
                <Activity size={11} className="text-(--primary) shrink-0" />
                <span className="truncate leading-snug">Gate 7 scanner flow: <span className="font-semibold text-(--foreground)">12 p/m</span> (Mitigation active)</span>
              </div>
              <div className="flex items-center gap-2 border-l-2 border-blue-500/25 pl-2 py-0.5">
                <Wifi size={11} className="text-blue-500 shrink-0" />
                <span className="truncate leading-snug">Turnstile connectivity: <span className="font-semibold text-(--foreground)">100% online</span> (RFID check OK)</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex items-center justify-between text-[8px] font-mono text-(--foreground-subtle) bg-(--surface-1)/50 px-2 py-1 rounded border border-(--border)/60">
        <span>AI Monitoring: <span className="text-(--primary) font-extrabold">ENABLED</span></span>
        <span suppressHydrationWarning>Scan Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      </div>
      
      {filteredIncidents.length <= 1 && domain !== 'transport' && (
        <div className="text-[8.5px] text-center font-mono text-(--foreground-subtle) bg-green-500/3 border border-green-500/10 rounded py-1">
          No additional incidents detected.
        </div>
      )}
    </div>
  );
}
