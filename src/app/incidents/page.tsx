import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { ShieldAlert } from 'lucide-react';

export default function IncidentsPage() {
  return (
    <PageContainer>
      <div className="space-y-(--card-gap) animate-fade-in">
        <div className="bg-(--surface-1) border border-(--border) rounded-card p-6 min-h-120 flex flex-col justify-between">
          <div>
            <SectionHeader
              title="Live Incidents Command Console"
              description="Real-time incident streams, operational queue filters, and response dispatches"
            />
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-(--border) rounded-md bg-(--surface-2) p-10 text-center my-6">
            <ShieldAlert size={36} className="text-red-500 opacity-60 mb-3" />
            <h2 className="text-sm font-bold text-(--foreground) uppercase tracking-wide">Triage Stream</h2>
            <p className="text-xs text-(--foreground-muted) max-w-lg mt-1.5 leading-relaxed">
              This panel manages multi-modal ticketing, security, and medical dispatch routes for the FIFA World Cup 2026. Live feeds are currently aggregated on the main Dashboard view. Full grid controls are initializing.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="text-[10px] font-semibold text-(--primary) bg-(--primary-muted) px-2 py-0.5 rounded border border-(--primary-light) font-mono">
                DISPATCH LAYER active
              </span>
              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-mono">
                v0.2.0 · Refined
              </span>
            </div>
          </div>

          <div className="border-t border-(--border) pt-4 flex justify-between text-[9px] font-mono text-(--foreground-subtle)">
            <span>CONSOLE STATUS: STABLE</span>
            <span>FIFA WORLD CUP 2026</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
