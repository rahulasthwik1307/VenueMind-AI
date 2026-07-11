'use client';

import { m } from 'framer-motion';
import { Sparkles, Brain } from 'lucide-react';
import { cn } from '@/utils/cn';
import { AnimatedNumber } from './AnimatedNumber';
import type { AssistantDomain } from '@/types/assistant';

interface CopilotIdlePanelProps {
  domain: AssistantDomain;
  onAskAI: () => void;
}

export function CopilotIdlePanel({ domain, onAskAI }: CopilotIdlePanelProps) {
  return (
    <m.div
      key="idle"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center text-center pt-2 px-1 pb-0 h-full justify-between"
    >
      {/* Section 1: Header */}
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-full bg-(--primary-muted) flex items-center justify-center mb-1">
          <Sparkles size={15} className="text-(--primary) live-indicator" />
        </div>
        <p className="text-xs font-semibold text-(--foreground)">Operational Assistant</p>
        <p className="text-[10px] text-(--foreground-subtle) mt-0.5 max-w-xs leading-relaxed">
          Generate real-time tactical briefs, risk predictions, and response workflows scoped to {domain} events.
        </p>
      </div>

      {/* Section 2: Core Metrics */}
      <div className="w-full border-t border-(--border)/60 pt-3 mt-3">
        <div className="flex flex-col space-y-1.5 w-full">
          <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-1">
            <span className="text-(--foreground-muted) font-medium">AI Readiness</span>
            <span className="font-bold text-(--foreground)">
              <AnimatedNumber value={98} suffix="%" /> — Ready
            </span>
          </div>
          <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-1">
            <span className="text-(--foreground-muted) font-medium">System Focus</span>
            <span className="font-bold text-(--foreground) uppercase">{domain} Ops</span>
          </div>
          <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-1">
            <span className="text-(--foreground-muted) font-medium">Active Alerts</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">1 Warning Active</span>
          </div>
          <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-1">
            <span className="text-(--foreground-muted) font-medium">Telemetry</span>
            <span className="font-bold text-(--foreground)">
              <AnimatedNumber value={100} suffix="%" /> Online
            </span>
          </div>
        </div>
      </div>

      {/* Section 3: AI Diagnostics */}
      <div className="w-full border-t border-(--border)/60 pt-3 mt-3">
        <div className="flex flex-col space-y-1.5 w-full">
          <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-1">
            <span className="text-(--foreground-muted) font-medium">AI Status</span>
            <span className="font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider w-max">
              Nominal
            </span>
          </div>
          <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-1">
            <span className="text-(--foreground-muted) font-medium">Last Analysis</span>
            <span className="font-bold text-(--foreground)">Just now</span>
          </div>
          <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-1">
            <span className="text-(--foreground-muted) font-medium">Confidence</span>
            <span className="font-bold text-(--foreground)">99.2%</span>
          </div>
        </div>
      </div>

      {/* Section 4: Operational Intelligence */}
      <div className="w-full border-t border-(--border)/60 pt-3 mt-3">
        <div className="flex flex-col space-y-1.5 w-full">
          <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-1">
            <span className="text-(--foreground-muted) font-medium">Threat Assessment</span>
            <span className="font-bold text-green-500">Updated</span>
          </div>
          <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-1">
            <span className="text-(--foreground-muted) font-medium">Decision Model</span>
            <span className="font-bold text-(--foreground)">Active</span>
          </div>
          <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-1">
            <span className="text-(--foreground-muted) font-medium">Recommendation Queue</span>
            <span className="font-bold text-(--foreground)">Ready</span>
          </div>
        </div>
      </div>

      {/* Section 5: Action Area */}
      <div className="w-full border-t border-(--border)/60 pt-3 mt-auto">
        <div className="flex items-center justify-center gap-1.5 text-[8.5px] font-mono text-(--foreground-muted) mb-2.5 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span>Monitoring Cycle: Live</span>
        </div>
        <button
          onClick={onAskAI}
          className={cn(
            "w-full h-11 flex items-center justify-center gap-2 rounded-md shrink-0",
            "bg-(--primary) text-white font-semibold text-xs shadow-sm hover:bg-(--primary-hover) active:scale-[0.99] transition-all duration-150 cursor-pointer group"
          )}
          aria-label={`Ask AI about ${domain} operations`}
        >
          <Brain size={13} className="group-hover:rotate-12 transition-transform duration-200" />
          <span>Ask AI about {domain === 'accessibility' ? 'Accessibility' : domain.charAt(0).toUpperCase() + domain.slice(1)}</span>
        </button>
      </div>
    </m.div>
  );
}
