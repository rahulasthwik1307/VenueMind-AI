'use client';

import { useUIStore } from '@/store/modules/ui';
import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { Settings, Activity, AlertTriangle, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function SettingsPage() {
  const { telemetryFaultActive, setTelemetryFault } = useUIStore();

  return (
    <PageContainer>
      <div className="space-y-(--card-gap) animate-fade-in">
        {/* System Config Card */}
        <div className="bg-(--surface-1) border border-(--border) rounded-card p-6 flex flex-col gap-6">
          <div>
            <SectionHeader
              title="System Configuration &amp; Console Settings"
              description="Configure AI thresholds, sensor polling limits, theme settings, and personnel API nodes"
            />
          </div>

          {/* Placeholder main config area */}
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-(--border) rounded-md bg-(--surface-2) p-10 text-center">
            <Settings size={36} className="text-(--primary) opacity-65 mb-3" />
            <h2 className="text-sm font-bold text-(--foreground) uppercase tracking-wide">System Core Config</h2>
            <p className="text-xs text-(--foreground-muted) max-w-lg mt-1.5 leading-relaxed">
              Tweak AI models sensitivity (default 80% confidence trigger), local database syncing rates, and system theme preferences.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="text-[10px] font-semibold text-(--primary) bg-(--primary-muted) px-2 py-0.5 rounded border border-(--primary-light) font-mono">
                CONFIG WRITE LOCKED
              </span>
              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-mono">
                Operator: Rahul
              </span>
            </div>
          </div>

          {/* ── System Diagnostics Section ───────────────────────── */}
          <div className="border border-(--border) rounded-xl overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 bg-(--surface-2) border-b border-(--border)">
              <Activity size={13} className="text-(--primary)" />
              <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider">System Diagnostics</h3>
              <span className="ml-auto text-[9px] font-mono text-(--foreground-subtle) uppercase">Dev Controls</span>
            </div>

            <div className="divide-y divide-(--border)">
              {/* Telemetry Fault Toggle */}
              <div className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      size={12}
                      className={cn(
                        'shrink-0 transition-colors',
                        telemetryFaultActive ? 'text-red-500' : 'text-(--foreground-subtle)'
                      )}
                    />
                    <p className="text-xs font-semibold text-(--foreground)">Simulate Telemetry Fault</p>
                  </div>
                  <p className="text-[10.5px] text-(--foreground-muted) mt-1 leading-relaxed max-w-lg">
                    Activates the telemetry-disconnect error state across all lens pages (Crowd, Transport, Emergency,
                    Accessibility). Use to verify operator error recovery workflows without touching live sensor nodes.
                  </p>
                  {telemetryFaultActive && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[9px] font-mono font-bold text-red-500 bg-red-950/15 border border-red-900/30 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
                      FAULT ACTIVE — All lens pages showing error state
                    </div>
                  )}
                </div>

                {/* Toggle switch */}
                <div className="shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
                  <button
                    id="telemetry-fault-toggle"
                    role="switch"
                    aria-checked={telemetryFaultActive}
                    aria-label={
                      telemetryFaultActive
                        ? 'Disable simulated telemetry fault'
                        : 'Enable simulated telemetry fault'
                    }
                    onClick={() => setTelemetryFault(!telemetryFaultActive)}
                    className={cn(
                      'relative w-11 h-6 rounded-full border transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)',
                      telemetryFaultActive
                        ? 'bg-red-600/80 border-red-700'
                        : 'bg-(--surface-3) border-(--border)'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-5 h-5 rounded-full shadow-sm transition-all duration-200 flex items-center justify-center',
                        telemetryFaultActive
                          ? 'translate-x-5 bg-white'
                          : 'translate-x-0.5 bg-(--foreground-subtle)'
                      )}
                      aria-hidden="true"
                    >
                      {telemetryFaultActive && <AlertTriangle size={8} className="text-red-600" />}
                      {!telemetryFaultActive && <Check size={8} className="text-(--surface-1)" />}
                    </span>
                  </button>
                  <span className={cn(
                    'text-[9px] font-mono font-bold uppercase',
                    telemetryFaultActive ? 'text-red-500' : 'text-(--foreground-subtle)'
                  )}>
                    {telemetryFaultActive ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-(--border) pt-4 flex justify-between text-[9px] font-mono text-(--foreground-subtle)">
            <span>CONSOLE STATUS: LOCKED</span>
            <span>FIFA WORLD CUP 2026</span>
          </div>
        </div>

        {/* Relocated project attribution info */}
        <div className="border border-(--border) rounded-card overflow-hidden">
          <AppFooter />
        </div>
      </div>
    </PageContainer>
  );
}
