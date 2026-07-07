import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Bus } from 'lucide-react';

export default function TransportPage() {
  return (
    <PageContainer>
      <div className="space-y-(--card-gap) animate-fade-in">
        <div className="bg-(--surface-1) border border-(--border) rounded-card p-6 min-h-120 flex flex-col justify-between">
          <div>
            <SectionHeader
              title="Transit & Shuttle Telemetry Console"
              description="Monitoring metro lines, shuttle bus routes, external junctions delays, and VIP dropoff rates"
            />
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-(--border) rounded-md bg-(--surface-2) p-10 text-center my-6">
            <Bus size={36} className="text-indigo-500 opacity-65 mb-3" />
            <h2 className="text-sm font-bold text-(--foreground) uppercase tracking-wide">Transit Telemetry</h2>
            <p className="text-xs text-(--foreground-muted) max-w-lg mt-1.5 leading-relaxed">
              Tracking fleet GPS lines and intersection sags (such as Al Khor delay). Alternative Expressway Route C bypass is active and monitored.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="text-[10px] font-semibold text-(--primary) bg-(--primary-muted) px-2 py-0.5 rounded border border-(--primary-light) font-mono">
                GPS FEED ONLINE
              </span>
              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-mono">
                12 VEHICLES TRACKED
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
