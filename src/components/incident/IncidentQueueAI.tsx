'use client';

/**
 * IncidentQueueAI — AI Prioritization Panel for the Incidents Console
 *
 * Distinct entry point from:
 * - Dashboard "Triage Highest Priority" (single incident opener)
 * - Lens page "Domain Copilot" (scoped to one domain)
 *
 * Uses submitQuery with mode: 'incidents' to request a ranked prioritization
 * of all open incidents via the structured contextBuilder pipeline.
 *
 * Patterns adhered to:
 * - AI button is disabled + aria-disabled while isAnalyzing
 * - Response area wrapped in aria-live="polite"
 * - Uses AnalyzingState, CommandCenterError, AIResponseCard (consistent with Command Center)
 */

import { useCallback, useState, useEffect } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIncidentStore } from '@/store/modules/incident';
import { useAssistantStore } from '@/store/modules/assistant';
import { AnalyzingState } from '@/components/ai/AnalyzingState';
import { CommandCenterError } from '@/components/ai/CommandCenterError';
import { AIResponseCard } from '@/components/ai/AIResponseCard';

// Lightweight count-up number component for operational telemetry metrics
function AnimatedNumber({
  value,
  duration = 750,
  suffix = '',
  formatter,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  formatter?: (val: number) => string;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const end = value;
    if (end === 0) {
      return;
    }

    const startTime = performance.now();
    let animationFrameId: number;

    const updateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = progress * (2 - progress); // easeOutQuad
      const currentVal = Math.round(easedProgress * end);

      setCurrent(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateNumber);
      }
    };

    animationFrameId = requestAnimationFrame(updateNumber);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  const formatted = formatter ? formatter(current) : current.toLocaleString();
  return <span className="tabular-nums font-bold">{formatted}{suffix}</span>;
}

export function IncidentQueueAI() {
  const { incidents, addActivity, addToast } = useIncidentStore();
  const { lastResponse, isAnalyzing, error, submitQuery, clearHistory, clearError } =
    useAssistantStore();

  const [hasRequested, setHasRequested] = useState(false);

  const severityWeight = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const sortedOpenIncidents = [...incidents]
    .filter((i) => i.status !== 'resolved')
    .sort((a, b) => {
      const weightA = severityWeight[a.severity] ?? 0;
      const weightB = severityWeight[b.severity] ?? 0;
      if (weightB !== weightA) {
        return weightB - weightA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const totalOpenCount = sortedOpenIncidents.length;
  const cappedOpenIncidents = sortedOpenIncidents.slice(0, 20);
  const cappedIncidentIds = cappedOpenIncidents.map((i) => i.id);
  const isCapped = totalOpenCount > 20;

  const criticalOpenCount = sortedOpenIncidents.filter((i) => i.severity === 'critical').length;
  const avgAiConfidence = totalOpenCount > 0
    ? Math.round(sortedOpenIncidents.reduce((sum, current) => sum + (current.aiConfidence ?? 85), 0) / totalOpenCount)
    : 98;

  const handleAskAI = useCallback(() => {
    if (isAnalyzing || totalOpenCount === 0) return;
    clearError();
    setHasRequested(true);
    // Uses the structured 'incidents' mode — no manual prompt construction
    submitQuery({
      mode: 'incidents',
      rawQuery: isCapped
        ? `Rank the top 20 highest-priority open incidents (out of ${totalOpenCount} total open incidents) by operational priority and recommend the optimal response sequence with rationale. Note: results are based on the top 20 open incidents.`
        : 'Rank these open incidents by operational priority and recommend the optimal response sequence with rationale.',
      persona: 'operations',
      incidentIds: cappedIncidentIds,
    });
  }, [isAnalyzing, totalOpenCount, isCapped, cappedIncidentIds, clearError, submitQuery]);

  const handleRetry = useCallback(() => {
    handleAskAI();
  }, [handleAskAI]);

  const handleClear = useCallback(() => {
    clearHistory();
    setHasRequested(false);
  }, [clearHistory]);

  const handleDispatch = useCallback(
    (actionText: string) => {
      try {
        addActivity(
          `AI Prioritization Dispatched: ${actionText.slice(0, 80)}${actionText.length > 80 ? '…' : ''}`,
          'Incidents AI Copilot',
          'high'
        );
        addToast('AI recommendation dispatched to Ops Timeline', 'success');
      } catch (err: unknown) {
        addToast(`Dispatch failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
      }
    },
    [addActivity, addToast]
  );

  type ResponseState = 'idle' | 'analyzing' | 'error' | 'response';
  let responseState: ResponseState = 'idle';
  if (hasRequested) {
    if (isAnalyzing) responseState = 'analyzing';
    else if (error) responseState = 'error';
    else if (lastResponse) responseState = 'response';
  }

  return (
    <section
      className="bg-(--surface-1) border border-(--border) rounded-xl overflow-hidden flex flex-col h-fit self-start shadow-sm"
      aria-label="AI Queue Prioritization Panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 md:px-4.5 md:py-3 bg-(--surface-2) border-b border-(--border) shrink-0">
        <div className="flex items-center gap-2">
          <Brain size={13} className="text-(--primary)" />
          <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider">
            AI Queue Prioritization
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {responseState === 'response' && (
            <button
              onClick={handleClear}
              className="text-[9px] font-mono text-(--foreground-muted) hover:text-(--foreground) border border-(--border) px-1.5 py-0.5 rounded bg-(--surface-1) cursor-pointer transition-colors shadow-xs active:scale-[0.98]"
              aria-label="Clear AI prioritization response"
            >
              Clear
            </button>
          )}
          <span className="text-[9px] font-mono text-(--foreground-subtle)">
            {totalOpenCount} open
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 pb-2 md:p-4 md:pb-3 flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {responseState === 'idle' && (
            <m.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center w-full gap-3 md:gap-6 flex-1"
            >
              {/* Section 1: Header */}
              <div className="flex flex-col items-center pt-2 md:pt-6">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-(--primary-muted) flex items-center justify-center mb-1">
                  <Sparkles size={14} className="text-(--primary) live-indicator" />
                </div>
                <p className="text-xs font-semibold text-(--foreground)">Prioritize Open Queue</p>
                <p className="text-[10px] text-(--foreground-subtle) mt-0.5 max-w-xs leading-relaxed">
                  Analyze active incidents to calculate optimal dispatch workflows and operational response priorities.
                </p>
              </div>

              {/* Section 2: Operational Metrics */}
              <div className="w-full border-t border-(--border)/60 pt-2 mt-0 md:pt-3 md:mt-1">
                <div className="flex flex-col space-y-0.5 md:space-y-1.5 w-full">
                  <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-0.5 md:py-1">
                    <span className="text-(--foreground-muted) font-medium">Queue Size</span>
                    <span className="font-bold text-(--foreground)">{totalOpenCount} Open</span>
                  </div>
                  <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-0.5 md:py-1">
                    <span className="text-(--foreground-muted) font-medium">Critical Incidents</span>
                    <span className={cn("font-bold", criticalOpenCount > 0 ? "text-red-600 dark:text-red-400" : "text-(--foreground)")}>
                      {criticalOpenCount} Critical
                    </span>
                  </div>
                  <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-0.5 md:py-1">
                    <span className="text-(--foreground-muted) font-medium">AI Confidence</span>
                    <span className="font-bold text-(--foreground)">
                      <AnimatedNumber value={avgAiConfidence} suffix="%" />
                    </span>
                  </div>
                  <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-0.5 md:py-1">
                    <span className="text-(--foreground-muted) font-medium">Recommendation Status</span>
                    <span className="font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider w-max">
                      Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Operational Intelligence */}
              <div className="w-full border-t border-(--border)/60 pt-2 mt-0 md:pt-3 md:mt-1">
                <div className="flex flex-col space-y-0.5 md:space-y-1.5 w-full">
                  <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-0.5 md:py-1">
                    <span className="text-(--foreground-muted) font-medium">Risk Assessment</span>
                    <span className="font-bold text-green-500">Updated</span>
                  </div>
                  <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-0.5 md:py-1">
                    <span className="text-(--foreground-muted) font-medium">Priority Engine</span>
                    <span className="font-bold text-(--foreground)">Active</span>
                  </div>
                  <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-0.5 md:py-1">
                    <span className="text-(--foreground-muted) font-medium">Last Analysis</span>
                    <span className="font-bold text-(--foreground)">Pending</span>
                  </div>
                  <div className="flex items-center justify-between w-full text-[9.5px] font-mono leading-none py-0.5 md:py-1">
                    <span className="text-(--foreground-muted) font-medium">Decision Status</span>
                    <span className="font-bold text-(--foreground)">Ready</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Action Area */}
              <div className="w-full border-t border-(--border)/60 pt-2 mt-0 md:pt-3 md:mt-1">
                <div className="flex items-center justify-center gap-1.5 text-[8.5px] font-mono text-(--foreground-muted) mb-1.5 md:mb-2 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>Monitoring Cycle: Live</span>
                </div>
                <button
                  onClick={handleAskAI}
                  disabled={isAnalyzing || totalOpenCount === 0}
                  aria-disabled={isAnalyzing || totalOpenCount === 0}
                  className={cn(
                    "w-full h-11 flex items-center justify-center gap-2 rounded-md shrink-0 transition-all duration-150",
                    "bg-(--primary) text-white font-semibold text-xs shadow-sm hover:bg-(--primary-hover) active:scale-[0.99] cursor-pointer group",
                    (isAnalyzing || totalOpenCount === 0) ? "opacity-50 cursor-not-allowed" : ""
                  )}
                  aria-label={
                    totalOpenCount === 0
                      ? 'No open incidents to prioritize'
                      : isAnalyzing
                      ? 'AI analysis in progress'
                      : isCapped
                      ? `Ask AI to prioritize top 20 open incidents`
                      : `Ask AI to prioritize ${totalOpenCount} open incidents`
                  }
                >
                  <Brain size={13} className="group-hover:rotate-12 transition-transform duration-200 animate-pulse" />
                  <span>Ask AI to Prioritize My Open Queue</span>
                </button>
              </div>
            </m.div>
          )}

          {responseState === 'analyzing' && (
            <m.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <AnalyzingState />
            </m.div>
          )}

          {responseState === 'error' && error && (
            <m.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <CommandCenterError error={error} onRetry={handleRetry} />
            </m.div>
          )}

          {responseState === 'response' && lastResponse && (
            <m.div
              key="response"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full overflow-y-auto max-h-150 pr-0.5"
              // aria-live on the response container — announces results to screen readers
              aria-live="polite"
              aria-atomic="false"
            >
              {isCapped && (
                <div className="mb-3 text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 px-2.5 py-1.5 rounded-md">
                  ⚠️ Queue exceeds 20 open incidents. Analysis is based on the top 20 highest-severity and most recent incidents.
                </div>
              )}
              <AIResponseCard
                response={lastResponse}
                onDispatchAction={handleDispatch}
              />
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 md:px-4 md:py-2.5 bg-(--surface-2)/40 border-t border-(--border) flex justify-between items-center text-[9px] font-mono text-(--foreground-subtle) shrink-0 select-none">
        <span>AI CO-PROCESSOR — ACTIVE</span>
        <span>STATUS: LIVE</span>
      </div>
    </section>
  );
}
