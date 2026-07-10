'use client';

import { useIncidentStore } from '@/store/modules/incident';
import { LensPageLayout } from '@/components/operations/LensPageLayout';
import { ShieldAlert, HeartPulse, Shield, Eye, Flame, AlertCircle, CheckCircle, Brain } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SystemStatusLevel } from '@/types/common';
import { getTimeAgo } from '@/components/operations/CriticalIncidents';

export default function EmergencyPage() {
  const { stadiumStats, incidents } = useIncidentStore();
  const medicalStandby = stadiumStats.medicalStandby; // Deployed/available count

  // Calculate active emergency indicators
  const activeCriticalIncident = incidents.find((i) => i.severity === 'critical' && i.status !== 'resolved');
  const isAlertActive = activeCriticalIncident !== undefined;
  const activeCritical = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;
  
  const systemHealth = {
    perimeter: isAlertActive ? 'degraded' as const : 'operational' as const,
    medical: medicalStandby > 4 ? 'operational' as const : 'degraded' as const,
    fireAlarms: 'operational' as const,
    evacPaths: 'operational' as const,
  };

  const getStatusBadgeStyle = (level: SystemStatusLevel) => {
    const styles = {
      operational: 'text-green-700 bg-green-50 border-green-100 dark:text-green-400 dark:bg-green-950/20 dark:border-green-900/40',
      degraded: 'text-yellow-700 bg-yellow-50 border-yellow-100 dark:text-yellow-400 dark:bg-yellow-950/20 dark:border-yellow-900/40',
      critical: 'text-red-700 bg-red-50 border-red-100 dark:text-red-400 dark:bg-red-950/20 dark:border-red-900/40',
      offline: 'text-gray-500 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950/20 dark:border-gray-800/30',
    };
    return styles[level];
  };

  const getStatusText = (level: SystemStatusLevel) => {
    const texts = {
      operational: 'SECURE',
      degraded: 'ATTN REQUIRED',
      critical: 'STANDBY ALERT',
      offline: 'OFFLINE',
    };
    return texts[level];
  };

  // Redesigned Incident Command alertContent block
  const alertContent = isAlertActive && activeCriticalIncident ? (
    <div className="border border-red-900/20 bg-red-950/5 dark:border-red-900/30 dark:bg-red-950/10 rounded-xl p-4 flex flex-col justify-between h-full shadow-sm text-left">
      {/* Header */}
      <div className="flex items-start gap-3 pb-3 border-b border-(--border)">
        <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center shrink-0">
          <AlertCircle size={16} className="text-red-500 animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-(--foreground) uppercase tracking-wider truncate max-w-60 sm:max-w-xs md:max-w-md lg:max-w-50 xl:max-w-xs">
              {activeCriticalIncident.title}
            </h4>
            <span className="text-[8px] font-mono font-bold uppercase bg-red-500/15 text-red-700 dark:text-red-300 border border-red-500/25 px-1.5 py-0.5 rounded shrink-0 animate-pulse">
              Active
            </span>
          </div>
          <p className="text-[10px] text-(--foreground-muted) leading-relaxed mt-1">
            {activeCriticalIncident.description}
          </p>
        </div>
      </div>

      {/* Operational Metadata Grid (6 cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Incident Type</span>
          <span className="text-[11px] font-bold text-(--foreground) mt-0.5 block truncate capitalize">
            {activeCriticalIncident.category} Threat
          </span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Priority Level</span>
          <span className="text-[11px] font-bold text-red-600 dark:text-red-400 mt-0.5 block truncate uppercase">
            {activeCriticalIncident.severity}
          </span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Affected Zone</span>
          <span className="text-[11px] font-bold text-(--foreground) mt-0.5 block truncate">
            {activeCriticalIncident.location.zone}
          </span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Assigned Team</span>
          <span className="text-[11px] font-bold text-(--foreground) mt-0.5 block truncate">
            {activeCriticalIncident.assignedTeam || 'Unassigned'}
          </span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Evacuation Status</span>
          <span className="text-[11px] font-bold text-(--foreground) mt-0.5 block truncate">
            Standby / Armed
          </span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">AI Confidence</span>
          <span className="text-[11px] font-bold text-(--primary) mt-0.5 flex items-center gap-1">
            <Brain size={10} className="shrink-0" />
            <span>{activeCriticalIncident.aiConfidence || 95}% Match</span>
          </span>
        </div>
      </div>

      {/* Incident Response Timeline */}
      <div className="bg-(--surface-1)/40 border border-(--border)/50 rounded-lg p-3 my-2 text-left">
        <span className="block text-[7.5px] text-(--foreground-subtle) font-mono uppercase tracking-wider mb-3.5">
          Incident Response Timeline
        </span>

        <div className="relative pl-5 space-y-4">
          <div className="absolute left-1 top-1.5 bottom-1.5 w-0.5 bg-(--border-strong)/80 dark:bg-gray-700" />

          {/* Completed step: Emergency Detected */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-green-500 shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) font-semibold shrink-0">08:12 UTC</span>
              <span className="text-[9.5px] text-(--foreground-muted) font-semibold truncate">Emergency detected on sensor feed</span>
            </div>
            <span className="text-[7.5px] font-mono text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
              COMPLETED
            </span>
          </div>

          {/* Completed step: Command Center Verified */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-green-500 shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) font-semibold shrink-0">08:14 UTC</span>
              <span className="text-[9.5px] text-(--foreground-muted) font-semibold truncate">Command center dispatch verified</span>
            </div>
            <span className="text-[7.5px] font-mono text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
              COMPLETED
            </span>
          </div>

          {/* Running step: Response Team Dispatched */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="absolute -left-5.25 top-1 w-3.5 h-3.5 rounded-full bg-background border-2 border-amber-500 ring-2 ring-amber-500/25 shrink-0 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) font-semibold shrink-0">08:16 UTC</span>
              <span className="text-[9.5px] text-(--foreground-muted) font-semibold truncate">Response team dispatch active</span>
            </div>
            <span className="text-[7.5px] font-mono text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider animate-pulse">
              RUNNING
            </span>
          </div>

          {/* Pending step: Evacuation Protocol Activated */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1 opacity-60">
            <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-background border-2 border-(--border-strong) shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) font-semibold shrink-0">--:-- UTC</span>
              <span className="text-[9.5px] text-(--foreground-subtle) truncate">Evacuation protocol activation standby</span>
            </div>
            <span className="text-[7.5px] font-mono text-(--foreground-subtle) bg-(--surface-2) border border-(--border)/70 px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
              PENDING
            </span>
          </div>

          {/* Pending step: Incident Under Control */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1 opacity-60">
            <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-background border-2 border-(--border-strong) shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) font-semibold shrink-0">--:-- UTC</span>
              <span className="text-[9.5px] text-(--foreground-subtle) truncate">Incident control confirmation telemetry</span>
            </div>
            <span className="text-[7.5px] font-mono text-(--foreground-subtle) bg-(--surface-2) border border-(--border)/70 px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
              PENDING
            </span>
          </div>

          {/* Pending step: Resolution Pending */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1 opacity-60">
            <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-background border-2 border-(--border-strong) shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) font-semibold shrink-0">--:-- UTC</span>
              <span className="text-[9.5px] text-(--foreground-subtle) truncate">Final resolution status pending</span>
            </div>
            <span className="text-[7.5px] font-mono text-(--foreground-subtle) bg-(--surface-2) border border-(--border)/70 px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
              PENDING
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-(--border) flex items-center justify-between text-[8.5px] font-mono text-(--foreground-subtle)">
        <span>Incident Registered: {getTimeAgo(activeCriticalIncident.createdAt)}</span>
        <span>Est. Resolution: 15 min</span>
      </div>
    </div>
  ) : (
    <div className="border border-green-900/20 bg-green-950/5 rounded-xl p-4 flex flex-col justify-between h-full shadow-sm text-left">
      {/* Header */}
      <div className="flex items-start gap-3 pb-3 border-b border-(--border)">
        <div className="w-8 h-8 rounded bg-green-500/10 flex items-center justify-center shrink-0">
          <CheckCircle size={16} className="text-green-500" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-(--foreground) uppercase tracking-wider">All Operational Sectors Nominal</h4>
            <span className="text-[8px] font-mono font-bold uppercase bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/25 px-1.5 py-0.5 rounded shrink-0">
              Nominal
            </span>
          </div>
          <p className="text-[10px] text-(--foreground-muted) leading-relaxed mt-1">
            Perimeter security, medical standbys, and fire detection systems are reporting zero active alarms. Normal tournament operations active.
          </p>
        </div>
      </div>

      {/* Operational Metadata Grid (6 cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3">
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Emergency Fleet</span>
          <span className="text-[11px] font-bold text-(--foreground) mt-0.5 block truncate">100% Active</span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Evacuation Routes</span>
          <span className="text-[11px] font-bold text-(--foreground) mt-0.5 block truncate">Standby Ready</span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Medical Readiness</span>
          <span className="text-[11px] font-bold text-(--foreground) mt-0.5 block truncate">
            {medicalStandby} Standby Units
          </span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Security Patrols</span>
          <span className="text-[11px] font-bold text-(--foreground) mt-0.5 block truncate">
            24 Active Squads
          </span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Sensor Telemetry</span>
          <span className="text-[11px] font-bold text-(--foreground) mt-0.5 block truncate">
            4,200 Alarms Nominal
          </span>
        </div>
        <div className="bg-(--surface-1) border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
          <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">AI Safety Monitor</span>
          <span className="text-[11px] font-bold text-(--primary) mt-0.5 block truncate">Auditing Feeds</span>
        </div>
      </div>

      {/* Operational Benchmarks Timeline */}
      <div className="bg-(--surface-1)/40 border border-(--border)/50 rounded-lg p-3 my-2 text-left">
        <span className="block text-[7.5px] text-(--foreground-subtle) font-mono uppercase tracking-wider mb-3.5">
          Operational Benchmarks
        </span>

        <div className="relative pl-5 space-y-4">
          <div className="absolute left-1 top-1.5 bottom-1.5 w-0.5 bg-(--border-strong)/80 dark:bg-gray-700" />

          {/* Completed step */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-green-500 shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) font-semibold shrink-0">06:00 UTC</span>
              <span className="text-[9.5px] text-(--foreground-muted) font-semibold truncate">Daily briefing & safety system test complete</span>
            </div>
            <span className="text-[7.5px] font-mono text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
              COMPLETED
            </span>
          </div>

          {/* Completed step */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-green-500 shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) font-semibold shrink-0">07:30 UTC</span>
              <span className="text-[9.5px] text-(--foreground-muted) font-semibold truncate">SCADA system interlock audits verified nominal</span>
            </div>
            <span className="text-[7.5px] font-mono text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
              COMPLETED
            </span>
          </div>

          {/* Running step */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="absolute -left-5.25 top-1 w-3.5 h-3.5 rounded-full bg-background border-2 border-amber-500 ring-2 ring-amber-500/25 shrink-0 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) font-semibold shrink-0">08:15 UTC</span>
              <span className="text-[9.5px] text-(--foreground-muted) font-semibold truncate">Real-time gate locks & sensor telemetry feed</span>
            </div>
            <span className="text-[7.5px] font-mono text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider animate-pulse">
              RUNNING
            </span>
          </div>

          {/* Pending step */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-1 opacity-60">
            <div className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full bg-background border-2 border-(--border-strong) shrink-0" />
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-mono text-[8px] text-(--foreground-subtle) font-semibold shrink-0">09:45 UTC</span>
              <span className="text-[9.5px] text-(--foreground-subtle) truncate">Match-end egress auxiliary response ready status</span>
            </div>
            <span className="text-[7.5px] font-mono text-(--foreground-subtle) bg-(--surface-2) border border-(--border)/70 px-1.5 py-0.5 rounded shrink-0 uppercase tracking-wider">
              PENDING
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-(--border) flex items-center justify-between text-[8.5px] font-mono text-(--foreground-subtle)">
        <span>Console Status: ARMED</span>
        <span>FIFA WORLD CUP 2026</span>
      </div>
    </div>
  );

  return (
    <LensPageLayout
      domain="emergency"
      title="Emergency Operations Command"
      description="Critical security threats, medical evacuations, SCADA overrides, and structural alarm telemetry"
      statusPills={[
        { label: isAlertActive ? 'EMERGENCY ALERT' : 'EMERGENCY STACK STANDBY', level: isAlertActive ? 'critical' : 'operational' },
        { label: 'SECURE', level: 'operational' },
      ]}
      footerConsoleStatusText="CONSOLE STATUS: ARMED"
      incidentFilter={(i) => i.severity === 'critical' || i.category === 'security' || i.category === 'medical' || i.category === 'weather'}
      metrics={
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-(--surface-2)/45 border border-(--border) rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded bg-red-950/25 text-red-500 flex items-center justify-center shrink-0">
              <ShieldAlert size={15} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold text-(--foreground-subtle) uppercase">Critical Alerts</p>
              <p className="text-base font-bold font-mono tracking-tight mt-0.5">{activeCritical}</p>
            </div>
          </div>

          <div className="bg-(--surface-2)/45 border border-(--border) rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded bg-(--primary-muted) text-(--primary) flex items-center justify-center shrink-0">
              <HeartPulse size={15} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold text-(--foreground-subtle) uppercase">Medical Units</p>
              <p className="text-base font-bold font-mono tracking-tight mt-0.5">{medicalStandby} Deployed</p>
            </div>
          </div>

          <div className="bg-(--surface-2)/45 border border-(--border) rounded-xl p-3 flex items-center gap-3 shadow-xs">
            <div className="w-8 h-8 rounded bg-blue-950/20 text-blue-500 flex items-center justify-center shrink-0">
              <Eye size={15} />
            </div>
            <div>
              <p className="text-[10px] font-mono font-semibold text-(--foreground-subtle) uppercase">SCADA Relays</p>
              <p className="text-base font-bold font-mono tracking-tight mt-0.5">All Active</p>
            </div>
          </div>
        </div>
      }
      mainContent={
        <div className="border border-(--border) rounded-xl p-4 bg-(--surface-2)/20 space-y-4 h-full flex flex-col justify-between shadow-sm">
          <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider shrink-0">
            Critical Systems Status
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1">
            {/* Medical Stations */}
            <div className="bg-(--surface-1) border border-(--border) rounded-md p-3.5 flex flex-col justify-between min-h-40 shadow-xs hover:border-(--border-strong) transition-colors @container">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <HeartPulse size={14} className="text-red-500" />
                  <h4 className="text-xs font-bold text-(--foreground)">Medical Dispatch</h4>
                </div>
                <span className={cn('text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-wide uppercase', getStatusBadgeStyle(systemHealth.medical))}>
                  {getStatusText(systemHealth.medical)}
                </span>
              </div>
              <p className="text-[10px] text-(--foreground-muted) mt-1 leading-normal">
                Total availability: {medicalStandby} standby units. Nearest station East gate reports average response time of 2.8 minutes.
              </p>
              <div className="grid grid-cols-[max-content_1fr] @[310px]:grid-cols-[max-content_1fr_max-content_1fr] gap-x-3 gap-y-1.5 mt-2.5 pt-2 border-t border-(--border) text-[9.5px] font-mono">
                <span className="text-(--foreground-muted) font-medium">Readiness</span>
                <span className="font-bold text-(--foreground)">98%</span>
                <span className="text-(--foreground-muted) font-medium @[310px]:pl-3">Active Resources</span>
                <span className="font-bold text-(--foreground)">{medicalStandby} Units</span>
                <span className="text-(--foreground-muted) font-medium">Monitor State</span>
                <span className="font-bold text-(--foreground)">Live-Pulse</span>
                <span className="text-(--foreground-muted) font-medium @[310px]:pl-3">Last Verified</span>
                <span className="font-bold text-(--foreground)">1 min ago</span>
              </div>
              <div className="mt-3.5">
                <div className="flex items-center justify-between text-[8px] font-mono text-(--foreground-muted) uppercase tracking-wider mb-1 w-11/12">
                  <span>System Health</span>
                  <span className="font-bold text-(--foreground)">98%</span>
                </div>
                <div className="w-11/12 bg-(--surface-2) h-1.5 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-300", 
                    systemHealth.medical === 'operational' ? 'bg-(--color-success)' : 'bg-(--color-warning)'
                  )} style={{ width: '98%' }} />
                </div>
              </div>
            </div>

            {/* Perimeter & Security */}
            <div className="bg-(--surface-1) border border-(--border) rounded-md p-3.5 flex flex-col justify-between min-h-40 shadow-xs hover:border-(--border-strong) transition-colors @container">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-blue-500" />
                  <h4 className="text-xs font-bold text-(--foreground)">Perimeter Security</h4>
                </div>
                <span className={cn('text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-wide uppercase', getStatusBadgeStyle(systemHealth.perimeter))}>
                  {getStatusText(systemHealth.perimeter)}
                </span>
              </div>
              <p className="text-[10px] text-(--foreground-muted) mt-1 leading-normal">
                CCTV coverage: 99.8% active. 240 security staff deployed on site. Quick response squads stand by on sectors A & D.
              </p>
              <div className="grid grid-cols-[max-content_1fr] @[310px]:grid-cols-[max-content_1fr_max-content_1fr] gap-x-3 gap-y-1.5 mt-2.5 pt-2 border-t border-(--border) text-[9.5px] font-mono">
                <span className="text-(--foreground-muted) font-medium">Readiness</span>
                <span className="font-bold text-(--foreground)">99.8%</span>
                <span className="text-(--foreground-muted) font-medium @[310px]:pl-3">Active Resources</span>
                <span className="font-bold text-(--foreground)">240 Staff</span>
                <span className="text-(--foreground-muted) font-medium">Monitor State</span>
                <span className="font-bold text-(--foreground)">CCTV Feed</span>
                <span className="text-(--foreground-muted) font-medium @[310px]:pl-3">Last Verified</span>
                <span className="font-bold text-(--foreground)">3 min ago</span>
              </div>
              <div className="mt-3.5">
                <div className="flex items-center justify-between text-[8px] font-mono text-(--foreground-muted) uppercase tracking-wider mb-1 w-11/12">
                  <span>System Health</span>
                  <span className="font-bold text-(--foreground)">99.8%</span>
                </div>
                <div className="w-11/12 bg-(--surface-2) h-1.5 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-300", 
                    systemHealth.perimeter === 'operational' ? 'bg-(--color-success)' : 'bg-(--color-warning)'
                  )} style={{ width: '99.8%' }} />
                </div>
              </div>
            </div>

            {/* Fire Panels */}
            <div className="bg-(--surface-1) border border-(--border) rounded-md p-3.5 flex flex-col justify-between min-h-40 shadow-xs hover:border-(--border-strong) transition-colors @container">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Flame size={14} className="text-orange-500" />
                  <h4 className="text-xs font-bold text-(--foreground)">Fire Alarm Panels</h4>
                </div>
                <span className={cn('text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-wide uppercase', getStatusBadgeStyle(systemHealth.fireAlarms))}>
                  {getStatusText(systemHealth.fireAlarms)}
                </span>
              </div>
              <p className="text-[10px] text-(--foreground-muted) mt-1 leading-normal">
                Relays tested at pre-match briefing. All 4,200 sensors reporting normal temperature thresholds. Fire control board operational.
              </p>
              <div className="grid grid-cols-[max-content_1fr] @[310px]:grid-cols-[max-content_1fr_max-content_1fr] gap-x-3 gap-y-1.5 mt-2.5 pt-2 border-t border-(--border) text-[9.5px] font-mono">
                <span className="text-(--foreground-muted) font-medium">Readiness</span>
                <span className="font-bold text-(--foreground)">100%</span>
                <span className="text-(--foreground-muted) font-medium @[310px]:pl-3">Active Resources</span>
                <span className="font-bold text-(--foreground)">0 Faults</span>
                <span className="text-(--foreground-muted) font-medium">Monitor State</span>
                <span className="font-bold text-(--foreground)">Sensor Grid</span>
                <span className="text-(--foreground-muted) font-medium @[310px]:pl-3">Last Verified</span>
                <span className="font-bold text-(--foreground)">5 min ago</span>
              </div>
              <div className="mt-3.5">
                <div className="flex items-center justify-between text-[8px] font-mono text-(--foreground-muted) uppercase tracking-wider mb-1 w-11/12">
                  <span>System Health</span>
                  <span className="font-bold text-(--foreground)">100%</span>
                </div>
                <div className="w-11/12 bg-(--surface-2) h-1.5 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-300", 
                    systemHealth.fireAlarms === 'operational' ? 'bg-(--color-success)' : 'bg-(--color-warning)'
                  )} style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            {/* Evacuation Paths */}
            <div className="bg-(--surface-1) border border-(--border) rounded-md p-3.5 flex flex-col justify-between min-h-40 shadow-xs hover:border-(--border-strong) transition-colors @container">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} className="text-green-500" />
                  <h4 className="text-xs font-bold text-(--foreground)">Evacuation Corridors</h4>
                </div>
                <span className={cn('text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-wide uppercase', getStatusBadgeStyle(systemHealth.evacPaths))}>
                  {getStatusText(systemHealth.evacPaths)}
                </span>
              </div>
              <p className="text-[10px] text-(--foreground-muted) mt-1 leading-normal">
                Emergency gate locks monitored. Electromagnetic releases verified online. All auxiliary corridors and exit lanes clear of debris.
              </p>
              <div className="grid grid-cols-[max-content_1fr] @[310px]:grid-cols-[max-content_1fr_max-content_1fr] gap-x-3 gap-y-1.5 mt-2.5 pt-2 border-t border-(--border) text-[9.5px] font-mono">
                <span className="text-(--foreground-muted) font-medium">Readiness</span>
                <span className="font-bold text-(--foreground)">100%</span>
                <span className="text-(--foreground-muted) font-medium @[310px]:pl-3">Active Resources</span>
                <span className="font-bold text-(--foreground)">Relays OK</span>
                <span className="text-(--foreground-muted) font-medium">Monitor State</span>
                <span className="font-bold text-(--foreground)">Loop Verif</span>
                <span className="text-(--foreground-muted) font-medium @[310px]:pl-3">Last Verified</span>
                <span className="font-bold text-(--foreground)">2 min ago</span>
              </div>
              <div className="mt-3.5">
                <div className="flex items-center justify-between text-[8px] font-mono text-(--foreground-muted) uppercase tracking-wider mb-1 w-11/12">
                  <span>System Health</span>
                  <span className="font-bold text-(--foreground)">100%</span>
                </div>
                <div className="w-11/12 bg-(--surface-2) h-1.5 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-300", 
                    systemHealth.evacPaths === 'operational' ? 'bg-(--color-success)' : 'bg-(--color-warning)'
                  )} style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      }
      alertContent={alertContent}
    />
  );
}

