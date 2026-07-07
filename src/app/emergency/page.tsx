import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ShieldAlert } from 'lucide-react';

export default function EmergencyPage() {
  return (
    <PageContainer>
      <div className="space-y-(--card-gap) animate-fade-in">
        <div className="bg-(--surface-1) border border-(--border) rounded-card p-6 min-h-120 flex flex-col justify-between">
          <div>
            <SectionHeader
              title="Emergency Operations Command"
              description="Critical security threats, medical evacuations, SCADA overrides, and structural alarm telemetry"
            />
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-(--border) rounded-md bg-(--surface-2) p-10 text-center my-6">
            <ShieldAlert size={36} className="text-red-500 opacity-65 mb-3 animate-pulse" />
            <h2 className="text-sm font-bold text-(--foreground) uppercase tracking-wide">Emergency Services Dispatch</h2>
            <p className="text-xs text-(--foreground-muted) max-w-lg mt-1.5 leading-relaxed">
              Evacuation route management, fire panel relays, and direct links to civil defense. Security alerts (such as planter bags anomalies) are currently managed on the Dashboard queue.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 px-2 py-0.5 rounded border border-red-100 dark:border-red-900 font-mono">
                EMERGENCY STACK STANDBY
              </span>
              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-mono">
                SECURE
              </span>
            </div>
          </div>

          <div className="border-t border-(--border) pt-4 flex justify-between text-[9px] font-mono text-(--foreground-subtle)">
            <span>CONSOLE STATUS: ARMED</span>
            <span>FIFA WORLD CUP 2026</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
