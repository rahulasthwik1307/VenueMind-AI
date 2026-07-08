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

import { useCallback, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIncidentStore } from '@/store/modules/incident';
import { useAssistantStore } from '@/store/modules/assistant';
import { AnalyzingState } from '@/components/ai/AnalyzingState';
import { CommandCenterError } from '@/components/ai/CommandCenterError';
import { AIResponseCard } from '@/components/ai/AIResponseCard';

export function IncidentQueueAI() {
  const { incidents, addActivity, addToast } = useIncidentStore();
  const { lastResponse, isAnalyzing, error, submitQuery, clearHistory, clearError } =
    useAssistantStore();

  const [hasRequested, setHasRequested] = useState(false);

  const openIncidentIds = incidents
    .filter((i) => i.status !== 'resolved')
    .map((i) => i.id);

  const handleAskAI = useCallback(() => {
    if (isAnalyzing || openIncidentIds.length === 0) return;
    clearError();
    setHasRequested(true);
    // Uses the structured 'incidents' mode — no manual prompt construction
    submitQuery({
      mode: 'incidents',
      rawQuery: 'Rank these open incidents by operational priority and recommend the optimal response sequence with rationale.',
      persona: 'operations',
      incidentIds: openIncidentIds,
    });
  }, [isAnalyzing, openIncidentIds, clearError, submitQuery]);

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
      className="bg-(--surface-1) border border-(--border) rounded-xl overflow-hidden"
      aria-label="AI Queue Prioritization Panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-(--surface-2) border-b border-(--border)">
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
              className="text-[9px] font-mono text-(--foreground-muted) hover:text-(--foreground) border border-(--border) px-1.5 py-0.5 rounded bg-(--surface-1) cursor-pointer transition-colors"
              aria-label="Clear AI prioritization response"
            >
              Clear
            </button>
          )}
          <span className="text-[9px] font-mono text-(--foreground-subtle)">
            {openIncidentIds.length} open
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <AnimatePresence mode="wait">
          {responseState === 'idle' && (
            <m.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center text-center py-4"
            >
              <div className="w-12 h-12 rounded-full bg-(--primary-muted) flex items-center justify-center mb-3">
                <Sparkles size={18} className="text-(--primary)" />
              </div>
              <p className="text-sm font-semibold text-(--foreground)">Prioritize Open Queue</p>
              <p className="text-[11px] text-(--foreground-muted) mt-1.5 max-w-sm leading-relaxed">
                Ask AI to analyze all {openIncidentIds.length} open incident
                {openIncidentIds.length !== 1 ? 's' : ''} and recommend an
                optimal response sequence with ranked priorities and cross-domain risk analysis.
              </p>

              <button
                onClick={handleAskAI}
                disabled={isAnalyzing || openIncidentIds.length === 0}
                aria-disabled={isAnalyzing || openIncidentIds.length === 0}
                className={cn(
                  'mt-4 flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-150',
                  'bg-(--primary) text-white shadow-sm',
                  isAnalyzing || openIncidentIds.length === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-(--primary-hover) active:scale-[0.98] cursor-pointer'
                )}
                aria-label={
                  openIncidentIds.length === 0
                    ? 'No open incidents to prioritize'
                    : isAnalyzing
                    ? 'AI analysis in progress'
                    : `Ask AI to prioritize ${openIncidentIds.length} open incidents`
                }
              >
                <Brain size={14} />
                Ask AI to Prioritize My Open Queue
              </button>
            </m.div>
          )}

          {responseState === 'analyzing' && (
            <m.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
              // aria-live on the response container — announces results to screen readers
              aria-live="polite"
              aria-atomic="false"
            >
              <AIResponseCard
                response={lastResponse}
                onDispatchAction={handleDispatch}
              />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
