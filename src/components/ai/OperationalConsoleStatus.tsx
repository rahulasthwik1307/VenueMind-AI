'use client';

import { Cpu, Clock, Sliders, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface OperationalConsoleStatusProps {
  interactionMode: 'structured' | 'freeform';
  isAnalyzing: boolean;
}

export function OperationalConsoleStatus({
  interactionMode,
  isAnalyzing,
}: OperationalConsoleStatusProps) {
  return (
    <div
      className="rounded-xl border border-(--border) bg-(--surface-2)/30 px-3 py-2.5 flex flex-col gap-2 select-none shrink-0 shadow-xs max-h-26.25 overflow-hidden"
      aria-label="AI system status widget"
    >
      {/* Top Status Header */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-wider text-(--foreground-muted) font-mono">
          AI System Status
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all duration-150 font-mono shadow-2xs',
            isAnalyzing
              ? 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
              : 'text-(--primary) bg-(--primary-muted) border-(--primary-light) dark:border-(--primary)/20'
          )}
        >
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full shadow-xs',
              isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-(--primary)'
            )}
          />
          {isAnalyzing ? 'TRIAGING' : 'READY'}
        </span>
      </div>

      {/* Metrics Columns */}
      <div className="grid grid-cols-4 gap-2 pt-1 border-t border-black/5 dark:border-white/5">
        {/* Metric 1: Model */}
        <div className="flex flex-col items-center justify-center py-1 px-1 rounded-md border border-(--border) bg-(--surface-1) shadow-3xs transition-colors hover:border-(--border-strong)">
          <div className="flex items-center gap-1 mb-0.5">
            <Cpu size={10} className="text-(--primary) opacity-90" />
            <span className="text-[7.5px] font-bold text-(--foreground-subtle) uppercase tracking-wider font-mono">MODEL</span>
          </div>
          <span className="text-[8.5px] font-extrabold text-(--foreground) font-mono uppercase tracking-tight">
            LLAMA 3.3
          </span>
        </div>

        {/* Metric 2: Mode */}
        <div className="flex flex-col items-center justify-center py-1 px-1 rounded-md border border-(--border) bg-(--surface-1) shadow-3xs transition-colors hover:border-(--border-strong)">
          <div className="flex items-center gap-1 mb-0.5">
            <Sliders size={10} className="text-(--primary) opacity-90" />
            <span className="text-[7.5px] font-bold text-(--foreground-subtle) uppercase tracking-wider font-mono">MODE</span>
          </div>
          <span className="text-[8.5px] font-extrabold text-(--foreground) font-mono uppercase tracking-tight">
            {interactionMode === 'freeform' ? 'FREE' : 'STRUCT'}
          </span>
        </div>

        {/* Metric 3: Latency */}
        <div className="flex flex-col items-center justify-center py-1 px-1 rounded-md border border-(--border) bg-(--surface-1) shadow-3xs transition-colors hover:border-(--border-strong)">
          <div className="flex items-center gap-1 mb-0.5">
            <Clock size={10} className="text-(--primary) opacity-90" />
            <span className="text-[7.5px] font-bold text-(--foreground-subtle) uppercase tracking-wider font-mono">LATENCY</span>
          </div>
          <span className="text-[8.5px] font-extrabold text-(--foreground) font-mono uppercase tracking-tight">
            {isAnalyzing ? '0.2s...' : '<0.8s'}
          </span>
        </div>

        {/* Metric 4: Confidence */}
        <div className="flex flex-col items-center justify-center py-1 px-1 rounded-md border border-(--border) bg-(--surface-1) shadow-3xs transition-colors hover:border-(--border-strong)">
          <div className="flex items-center gap-1 mb-0.5">
            <CheckCircle size={10} className="text-(--primary) opacity-90" />
            <span className="text-[7.5px] font-bold text-(--foreground-subtle) uppercase tracking-wider font-mono">CONF.</span>
          </div>
          <span className="text-[8.5px] font-extrabold text-(--foreground) font-mono uppercase tracking-tight">
            99.4%
          </span>
        </div>
      </div>
    </div>
  );
}
