'use client';

import { useIncidentStore } from '@/store/modules/incident';
import { Brain, Sparkles, ChevronRight, Activity } from 'lucide-react';
import { cn } from '@/utils/cn';

interface StickyMiniAIQueueProps {
  onClick: () => void;
}

export function StickyMiniAIQueue({ onClick }: StickyMiniAIQueueProps) {
  const { incidents } = useIncidentStore();

  const openIncidents = incidents.filter((i) => i.status !== 'resolved');
  const totalOpenCount = openIncidents.length;
  const criticalOpenCount = openIncidents.filter((i) => i.severity === 'critical').length;
  const avgAiConfidence = totalOpenCount > 0
    ? Math.round(openIncidents.reduce((sum, current) => sum + (current.aiConfidence ?? 85), 0) / totalOpenCount)
    : 98;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-(--surface-1) border border-(--border) rounded-xl overflow-hidden shadow-sm flex flex-col",
        "active:scale-[0.99] transition-transform duration-200 cursor-pointer group"
      )}
      aria-label="Open AI Queue Prioritization"
    >
      <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-(--surface-2) border-b border-(--border)">
        <div className="flex items-center gap-2">
          <Brain size={13} className="text-(--primary)" />
          <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider">
            AI Queue Prioritization
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-(--primary) group-hover:translate-x-0.5 transition-transform">
          <span className="text-[10px] font-bold uppercase tracking-wide">Expand</span>
          <ChevronRight size={14} />
        </div>
      </div>

      <div className="flex items-center justify-between p-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-mono font-bold text-(--foreground)">
            {totalOpenCount} Open Incidents
          </span>
          <span className={cn(
            "text-[9px] font-mono font-bold",
            criticalOpenCount > 0 ? "text-red-500" : "text-(--foreground-subtle)"
          )}>
            {criticalOpenCount} Critical
          </span>
        </div>

        <div className="h-6 w-px bg-(--border)" aria-hidden="true" />

        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-mono font-bold text-(--foreground) flex items-center gap-1">
            <Sparkles size={10} className="text-(--primary) live-indicator" />
            {avgAiConfidence}% Confidence
          </span>
          <span className="text-[9px] font-mono font-bold text-green-500 flex items-center gap-1">
            <Activity size={10} />
            Ready for Analysis
          </span>
        </div>
      </div>
    </button>
  );
}
