'use client';

/**
 * AIResponseCard — Structured AI Response Renderer
 *
 * Renders an AIStructuredResponse using the shared ExpandableAICard pattern,
 * matching exactly what AIContextPanel already renders in the Digital Twin.
 * The rendering component is unchanged — only the data source differs.
 */

import { useState } from 'react';
import { m } from 'framer-motion';
import { Activity, AlertTriangle, ShieldCheck, Zap, Send, Brain, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ExpandableAICard } from '@/components/ai/ExpandableAICard';
import type { AIStructuredResponse } from '@/types/assistant';

interface AIResponseCardProps {
  response: AIStructuredResponse;
  /** Called when the operator dispatches the recommended response as an action */
  onDispatchAction?: (actionText: string) => void;
  className?: string;
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const level =
    confidence >= 90 ? 'high' : confidence >= 70 ? 'moderate' : confidence >= 50 ? 'low' : 'limited';
  const styles = {
    high: 'bg-(--primary-muted) border-(--primary-light) text-(--primary)',
    moderate: 'bg-blue-950/20 border-blue-900/40 text-blue-400',
    low: 'bg-amber-950/20 border-amber-900/40 text-amber-400',
    limited: 'bg-red-950/20 border-red-900/40 text-red-400',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded border font-mono text-[9px] font-bold uppercase tracking-wide',
        styles[level]
      )}
      role="status"
      aria-label={`AI confidence: ${confidence}%`}
    >
      <Zap size={9} aria-hidden="true" />
      {confidence}% CONFIDENCE · {level.toUpperCase()}
    </div>
  );
}

export function AIResponseCard({ response, onDispatchAction, className }: AIResponseCardProps) {
  const [prevResponse, setPrevResponse] = useState(response);
  const [isDispatched, setIsDispatched] = useState(false);

  if (response !== prevResponse) {
    setPrevResponse(response);
    setIsDispatched(false);
  }

  // Special branch for casual/non-operational messages to render a clean compact layout
  if (response.isNonOperational) {
    return (
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
        className={cn('border border-(--border) rounded-lg p-4 bg-(--surface-2) space-y-3 min-w-0 w-full overflow-x-hidden', className)}
        role="region"
        aria-label="AI system assistant notification"
      >
        <div className="flex items-center gap-2 text-(--foreground-subtle)">
          <Brain size={14} className="text-(--primary)" aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-wider font-mono">System Assistant</span>
        </div>
        <p className="text-xs text-(--foreground-muted) leading-relaxed">
          {response.situationOverview}
        </p>
        <div className="text-[10px] bg-(--surface-1) border border-(--border) rounded-md p-3 space-y-2">
          <p className="font-semibold text-(--foreground)">Try asking operational questions like:</p>
          <ul className="list-disc list-inside space-y-1 text-(--foreground-muted) pl-1">
            <li>&quot;What is the status of Gate A?&quot;</li>
            <li>&quot;Is there any crowd congestion at the West Parking?&quot;</li>
            <li>&quot;Summarize transport delays.&quot;</li>
          </ul>
        </div>
      </m.div>
    );
  }

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25 }}
      className={cn('space-y-3 min-w-0 w-full overflow-x-hidden', className)}
    >
      {/* Confidence badge */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[9px] font-mono text-(--foreground-subtle) uppercase tracking-wide">
          AI Operational Briefing
        </span>
        <ConfidenceBadge confidence={response.confidence} />
      </div>

      {/* Situation Overview */}
      <ExpandableAICard
        title="Situation Overview"
        icon={<Activity size={10} />}
        prose={response.situationOverview}
        theme="neutral"
        defaultExpanded
      />

      {/* Expected Risks */}
      <ExpandableAICard
        title="Predicted Risks"
        icon={<AlertTriangle size={10} />}
        prose={response.expectedRisks}
        theme="warning"
      />

      {/* Recommended Response */}
      <ExpandableAICard
        title="Recommended Response"
        icon={<ShieldCheck size={10} />}
        prose={response.recommendedResponse}
        theme="success"
      />

      {/* Estimated Impact */}
      <div className="text-[10px] text-(--foreground-muted) bg-(--surface-2) border border-(--border) rounded px-2.5 py-1.5">
        <span className="font-semibold text-(--foreground)">Estimated Impact: </span>
        {response.estimatedImpact}
      </div>

      {/* Dispatch recommended response as an activity */}
      {onDispatchAction && (
        <div className="w-full">
          {isDispatched ? (
            <span className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
              <Check size={12} strokeWidth={3} aria-hidden="true" />
              DISPATCHED
            </span>
          ) : (
            <button
              onClick={() => {
                onDispatchAction(response.recommendedResponse);
                setIsDispatched(true);
              }}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'px-4 py-2.5 rounded-md text-sm font-semibold',
                'bg-(--primary) text-white',
                'hover:bg-(--primary-hover) active:scale-[0.98]',
                'transition-all duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)'
              )}
              aria-label="Dispatch recommended response to Ops Timeline"
            >
              <Send size={13} aria-hidden="true" />
              Dispatch to Ops Timeline
            </button>
          )}
        </div>
      )}
    </m.div>
  );
}
