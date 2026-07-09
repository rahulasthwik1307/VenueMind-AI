'use client';

import { Sparkles, Check, Send, Clock, ShieldAlert, EyeOff, Brain, HelpCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Recommendation } from '@/types/incident';
import { m } from 'framer-motion';

export function shouldDisableActions(incidentStatus: string, recommendationExecuted: boolean): boolean {
  return incidentStatus === 'resolved' || recommendationExecuted;
}

interface DecisionCardProps {
  recommendation: Recommendation;
  onExecute: () => void;
  onDismiss?: () => void;
  isIncidentResolved?: boolean;
}

const PRIORITY_STYLES: Record<Recommendation['priority'], { border: string; bg: string; text: string }> = {
  critical: {
    border: 'border-l-red-600 dark:border-l-red-500',
    bg: 'bg-red-50/50 dark:bg-red-950/20',
    text: 'text-red-700 dark:text-red-400',
  },
  high: {
    border: 'border-l-orange-500',
    bg: 'bg-orange-50/30 dark:bg-orange-950/10',
    text: 'text-orange-700 dark:text-orange-400',
  },
  medium: {
    border: 'border-l-[var(--primary)]',
    bg: 'bg-(--primary-muted) dark:bg-[rgba(15,81,50,0.15)]',
    text: 'text-(--primary) dark:text-green-400',
  },
  low: {
    border: 'border-l-blue-400',
    bg: 'bg-blue-50/30 dark:bg-blue-950/10',
    text: 'text-blue-700 dark:text-blue-400',
  },
};

export function DecisionCard({ recommendation, onExecute, onDismiss, isIncidentResolved = false }: DecisionCardProps) {
  const styles = PRIORITY_STYLES[recommendation.priority];
  const isDisabled = shouldDisableActions(isIncidentResolved ? 'resolved' : 'open', recommendation.executed);

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'border border-(--border) border-l-4 rounded-md p-4 bg-(--surface-1)',
        styles.border,
        recommendation.executed && 'opacity-75 border-l-gray-400 bg-gray-50/30 dark:bg-gray-900/10'
      )}
      role="article"
      aria-label={`AI Recommendation: ${recommendation.title}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {recommendation.priority === 'critical' && (
              <ShieldAlert size={12} className="text-red-500 shrink-0 animate-pulse" />
            )}
            <h4 className="text-xs font-bold text-(--foreground) leading-snug">
              {recommendation.title}
            </h4>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex flex-col items-end shrink-0 gap-1">
          <span className="text-[9px] font-bold text-(--primary) bg-(--primary-light) dark:bg-green-950/40 dark:text-green-300 px-1.5 py-0.5 rounded font-mono">
            {recommendation.confidence}% CF
          </span>
          {recommendation.priority === 'critical' && (
            <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 tracking-wide font-mono">
              CRITICAL
            </span>
          )}
        </div>
      </div>

      {/* Structured Reasoning & Explanation */}
      <div className="mt-3 space-y-2 border-t border-(--border) pt-3 text-[10px] leading-relaxed">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {/* Situation */}
          <div className="space-y-0.5">
            <span className="font-semibold text-(--foreground) flex items-center gap-1">
              <HelpCircle size={11} className="text-(--foreground-subtle)" />
              Current Situation
            </span>
            <p className="text-(--foreground-muted) pl-4">{recommendation.explanation}</p>
          </div>

          {/* Reason */}
          <div className="space-y-0.5">
            <span className="font-semibold text-(--foreground) flex items-center gap-1">
              <Brain size={11} className="text-(--primary)" />
              AI Reason
            </span>
            <p className="text-(--foreground-muted) pl-4">
              Tactical modeling indicates this action resolves core stress factors with minimal resource displacement.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mt-2 border-t border-(--border) pt-2">
          {/* Expected Outcome */}
          <div className="space-y-0.5">
            <span className="font-semibold text-(--foreground) flex items-center gap-1">
              <Sparkles size={11} className="text-(--primary)" />
              Expected Result
            </span>
            <p className="text-(--foreground-muted) pl-4">{recommendation.expectedImpact}</p>
          </div>

          {/* Response ETA */}
          <div className="space-y-0.5">
            <span className="font-semibold text-(--foreground) flex items-center gap-1">
              <Clock size={11} className="text-blue-500" />
              Est. Resolution Time
            </span>
            <p className="text-(--foreground-muted) pl-4 font-mono">{recommendation.eta}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex items-center justify-between border-t border-(--border) pt-3">
        <span className="text-[9px] text-(--foreground-subtle) max-w-70 truncate">
          Action: <span className="font-medium font-mono text-(--foreground-muted)">{recommendation.action}</span>
        </span>
        
        <div className="flex items-center gap-2 shrink-0">
          {recommendation.executed ? (
            <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-2.5 py-1 rounded-sm border border-green-200 dark:border-green-900">
              <Check size={10} strokeWidth={3} />
              DISPATCHED
            </span>
          ) : (
            <>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  disabled={isDisabled}
                  className={cn(
                    'flex items-center gap-1 text-[9px] font-bold text-(--foreground-muted) bg-(--surface-3) border border-(--border-strong)',
                    'px-2.5 py-1 rounded-sm cursor-pointer',
                    'hover:bg-(--surface-4) hover:text-(--foreground) active:scale-95 transition-all duration-150',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary)',
                    isDisabled && 'opacity-40 cursor-not-allowed hover:bg-(--surface-3) hover:text-(--foreground-muted) active:scale-100'
                  )}
                  aria-label={`Dismiss recommendation: ${recommendation.title}`}
                >
                  <EyeOff size={10} />
                  Dismiss
                </button>
              )}
              
              <button
                onClick={onExecute}
                disabled={isDisabled}
                className={cn(
                  'flex items-center gap-1 text-[9px] font-bold text-white bg-(--primary)',
                  'px-3 py-1 rounded-sm',
                  'hover:bg-(--primary-hover) active:scale-95 transition-all duration-150',
                  'focus-visible:outline-(--focus-ring)',
                  isDisabled && 'opacity-40 cursor-not-allowed hover:bg-(--primary) active:scale-100'
                )}
                aria-label={`Dispatch Action: ${recommendation.title}`}
              >
                <Send size={10} strokeWidth={2.5} />
                Dispatch
              </button>
            </>
          )}
        </div>
      </div>
    </m.div>
  );
}
