import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Users } from 'lucide-react';

export default function CrowdMonitoringPage() {
  return (
    <PageContainer>
      <div className="space-y-(--card-gap) animate-fade-in">
        <div className="bg-(--surface-1) border border-(--border) rounded-card p-6 min-h-120 flex flex-col justify-between">
          <div>
            <SectionHeader
              title="Crowd Density & Flow Telemetry"
              description="Ingress flow rates, turnstile scanning speeds, and localized sector capacity limits"
            />
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-(--border) rounded-md bg-(--surface-2) p-10 text-center my-6">
            <Users size={36} className="text-(--primary) opacity-65 mb-3" />
            <h2 className="text-sm font-bold text-(--foreground) uppercase tracking-wide">Flow Analytics</h2>
            <p className="text-xs text-(--foreground-muted) max-w-lg mt-1.5 leading-relaxed">
              Analyzing ingress bottleneck points (such as Gate 7 congestion) and crowd counts in North/South/East/West Stands. Overall flow rates are visible on the dashboard.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="text-[10px] font-semibold text-(--primary) bg-(--primary-muted) px-2 py-0.5 rounded border border-(--primary-light) font-mono">
                CCTV FEEDS LINKED
              </span>
              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-mono">
                MONITORING
              </span>
            </div>
          </div>

          <div className="border-t border-(--border) pt-4 flex justify-between text-[9px] font-mono text-(--foreground-subtle)">
            <span>CONSOLE STATUS: OPERATIONAL</span>
            <span>FIFA WORLD CUP 2026</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
