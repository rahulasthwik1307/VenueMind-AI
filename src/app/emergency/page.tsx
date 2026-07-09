'use client';

import { useIncidentStore } from '@/store/modules/incident';
import { LensPageLayout } from '@/components/operations/LensPageLayout';
import { ShieldAlert, HeartPulse, Shield, Eye, Flame, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { SystemStatusLevel } from '@/types/common';

export default function EmergencyPage() {
  const { stadiumStats, incidents } = useIncidentStore();
  const medicalStandby = stadiumStats.medicalStandby; // Deployed/available count

  // Calculate active emergency indicators
  const activeCritical = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;
  const isAlertActive = activeCritical > 0;
  
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
      offline: 'text-gray-500 bg-gray-50 border-gray-200',
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

  const alertContent = isAlertActive ? (
    <div className="border border-red-950 bg-red-950/20 rounded-xl p-4 flex items-start gap-3 h-full shadow-sm">
      <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-xs font-bold text-red-600 dark:text-red-400">CRITICAL SAFETY ALERT</h4>
        <p className="text-[10px] text-red-700 dark:text-red-300 leading-relaxed mt-0.5">
          Active critical threats identified on queue. Dispatch teams must prioritize evacuations and SCADA interlocks immediately.
        </p>
      </div>
    </div>
  ) : (
    <div className="border border-green-900/20 bg-green-950/5 rounded-xl p-4 flex items-start gap-3 h-full shadow-sm">
      <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-xs font-bold text-green-600 dark:text-green-400">Sector Status Secure</h4>
        <p className="text-[10px] text-green-700 dark:text-green-300 leading-relaxed mt-0.5">
          Perimeter security, medical standbys, and fire detection systems are reporting zero active alarms. Normal tournament operations active.
        </p>
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
            <div className="bg-(--surface-1) border border-(--border) rounded-md p-3.5 flex flex-col justify-between h-32 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <HeartPulse size={14} className="text-red-500" />
                  <h4 className="text-xs font-bold text-(--foreground)">Medical Dispatch</h4>
                </div>
                <span className={cn('text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-wide uppercase', getStatusBadgeStyle(systemHealth.medical))}>
                  {getStatusText(systemHealth.medical)}
                </span>
              </div>
              <p className="text-[10px] text-(--foreground-muted) mt-1.5 leading-relaxed">
                Total availability: {medicalStandby} standby units. Nearest station East gate reports average response time of 2.8 minutes.
              </p>
              <div className="text-[9px] font-mono font-semibold text-(--foreground-subtle) border-t border-(--border) pt-2 mt-2">
                MED UNITS ACTIVE: {medicalStandby}
              </div>
            </div>

            {/* Perimeter & Security */}
            <div className="bg-(--surface-1) border border-(--border) rounded-md p-3.5 flex flex-col justify-between h-32 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-blue-500" />
                  <h4 className="text-xs font-bold text-(--foreground)">Perimeter Security</h4>
                </div>
                <span className={cn('text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-wide uppercase', getStatusBadgeStyle(systemHealth.perimeter))}>
                  {getStatusText(systemHealth.perimeter)}
                </span>
              </div>
              <p className="text-[10px] text-(--foreground-muted) mt-1.5 leading-relaxed">
                CCTV coverage: 99.8% active. 240 security staff deployed on site. Quick response squads stand by on sectors A & D.
              </p>
              <div className="text-[9px] font-mono font-semibold text-(--foreground-subtle) border-t border-(--border) pt-2 mt-2">
                ACTIVE SECURITY STAFF: 240
              </div>
            </div>

            {/* Fire Panels */}
            <div className="bg-(--surface-1) border border-(--border) rounded-md p-3.5 flex flex-col justify-between h-32 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Flame size={14} className="text-orange-500" />
                  <h4 className="text-xs font-bold text-(--foreground)">Fire Alarm Panels</h4>
                </div>
                <span className={cn('text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-wide uppercase', getStatusBadgeStyle(systemHealth.fireAlarms))}>
                  {getStatusText(systemHealth.fireAlarms)}
                </span>
              </div>
              <p className="text-[10px] text-(--foreground-muted) mt-1.5 leading-relaxed">
                Relays tested at pre-match briefing. All 4,200 sensors reporting normal temperature thresholds. Fire control board operational.
              </p>
              <div className="text-[9px] font-mono font-semibold text-(--foreground-subtle) border-t border-(--border) pt-2 mt-2">
                ACTIVE FAULTS: 0
              </div>
            </div>

            {/* Evacuation Paths */}
            <div className="bg-(--surface-1) border border-(--border) rounded-md p-3.5 flex flex-col justify-between h-32 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} className="text-green-500" />
                  <h4 className="text-xs font-bold text-(--foreground)">Evacuation Corridors</h4>
                </div>
                <span className={cn('text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border tracking-wide uppercase', getStatusBadgeStyle(systemHealth.evacPaths))}>
                  {getStatusText(systemHealth.evacPaths)}
                </span>
              </div>
              <p className="text-[10px] text-(--foreground-muted) mt-1.5 leading-relaxed">
                Emergency gate locks monitored. Electromagnetic releases verified online. All auxiliary corridors and exit lanes clear of debris.
              </p>
              <div className="text-[9px] font-mono font-semibold text-(--foreground-subtle) border-t border-(--border) pt-2 mt-2">
                RELEASE RELAYS: OK
              </div>
            </div>
          </div>
        </div>
      }
      alertContent={alertContent}
    />
  );
}
