import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Map, Pin } from 'lucide-react';

export default function InteractiveMapPage() {
  return (
    <PageContainer>
      <div className="space-y-(--card-gap) animate-fade-in">
        <div className="bg-(--surface-1) border border-(--border) rounded-card p-6 min-h-120 flex flex-col justify-between">
          <div>
            <SectionHeader
              title="Interactive Stadium Map Intelligence"
              description="Visualizing sensor heatmaps, sector details, entry turnstiles, and response unit positions"
            />
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-(--border) rounded-md bg-(--surface-2) p-10 text-center my-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#0f5132_1.5px,transparent_1.5px)] [background-size:16px_16px]" />
            <Map size={36} className="text-(--primary) opacity-65 mb-3" />
            <h2 className="text-sm font-bold text-(--foreground) uppercase tracking-wide">Stadium Cartography Grid</h2>
            <p className="text-xs text-(--foreground-muted) max-w-lg mt-1.5 leading-relaxed">
              Spatial layouts, GPS telemetry of dispatches, and crowd heatmap overlays. This interactive mapping component will be integrated in Stage 4.
            </p>
            <div className="mt-4 flex gap-2">
              <span className="text-[10px] font-semibold text-(--primary) bg-(--primary-muted) px-2 py-0.5 rounded border border-(--primary-light) font-mono">
                GEO-SERVER STANDBY
              </span>
              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 font-mono">
                STAGE 4 TARGET
              </span>
            </div>
          </div>

          <div className="border-t border-(--border) pt-4 flex justify-between text-[9px] font-mono text-(--foreground-subtle)">
            <span>CONSOLE STATUS: STANDBY</span>
            <span>FIFA WORLD CUP 2026</span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
