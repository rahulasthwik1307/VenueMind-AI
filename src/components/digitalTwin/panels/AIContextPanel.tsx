'use client';

/**
 * AIContextPanel — AI Operational Intelligence Panel
 *
 * Right panel showing:
 *  - Current Operational Summary (AI Situation Summary)
 *  - Predicted Risk assessment
 *  - Suggested Next Action
 *  - Active recommendation cards (with execute/dismiss)
 *
 * Reuses DecisionCard from the existing component library.
 */

import { m, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, AlertTriangle, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import { DecisionCard } from '@/components/cards/DecisionCard';
import type { Incident, IncidentAnalysis } from '@/types/incident';

interface AIContextPanelProps {
  activeIncident: Incident | null;
  activeAnalysis: IncidentAnalysis | null;
  onDispatch: (incidentId: string, recommendationId: string) => void;
  onDismiss: (incidentId: string, recommendationId: string) => void;
}

export function AIContextPanel({
  activeIncident,
  activeAnalysis,
  onDispatch,
  onDismiss,
}: AIContextPanelProps) {
  const activeRecommendations = activeAnalysis?.recommendations.filter(
    (r) => !r.dismissed && !r.executed,
  ) ?? [];

  const executedCount = activeAnalysis?.recommendations.filter((r) => r.executed).length ?? 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="px-3 pt-3 pb-2 border-b border-(--border) shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Brain size={13} className="text-(--primary)" aria-hidden="true" />
            <span className="text-xs font-bold text-(--foreground)">AI Context</span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-(--primary-muted) border border-(--primary-light)">
            <Sparkles size={9} className="text-(--primary)" aria-hidden="true" />
            <span className="text-[9px] font-semibold text-(--primary) uppercase tracking-wide font-mono">
              Live
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        <AnimatePresence mode="wait">
          {activeIncident && activeAnalysis ? (
            <m.div
              key={activeIncident.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {/* Incident reference */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-(--foreground-subtle) uppercase tracking-wider truncate">
                  {activeIncident.id.toUpperCase()} · {activeIncident.location.zone}
                </span>
                {activeIncident.aiConfidence && (
                  <span className="ml-auto shrink-0 text-[9px] font-bold text-(--primary) font-mono bg-(--primary-muted) px-1.5 py-0.5 rounded border border-(--primary-light)">
                    {activeIncident.aiConfidence}% CF
                  </span>
                )}
              </div>

              {/* ── Operational Summary ─────────────────────────────── */}
              <div className="bg-(--surface-2) border border-(--border) rounded-md p-2.5 space-y-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Activity size={10} className="text-(--primary)" aria-hidden="true" />
                  <span className="text-[9px] font-bold text-(--foreground) uppercase tracking-wide font-mono">
                    Operational Summary
                  </span>
                </div>
                <p className="text-[10px] text-(--foreground-muted) leading-relaxed">
                  {activeAnalysis.aiSituationSummary.explanation}
                </p>
              </div>

              {/* ── Predicted Risk ──────────────────────────────────── */}
              <div className="bg-amber-50 border border-amber-200 rounded-md p-2.5 space-y-1">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={10} className="text-amber-600" aria-hidden="true" />
                  <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wide font-mono">
                    Predicted Risk
                  </span>
                </div>
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  {activeAnalysis.aiSituationSummary.expectedRisks}
                </p>
              </div>

              {/* ── Suggested Next Action ───────────────────────────── */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-2.5 space-y-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={10} className="text-emerald-700" aria-hidden="true" />
                  <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wide font-mono">
                    Suggested Next Action
                  </span>
                </div>
                <p className="text-[10px] text-emerald-800 leading-relaxed">
                  {activeAnalysis.aiSituationSummary.recommendedResponse}
                </p>
              </div>

              {/* ── Estimated Impact ────────────────────────────────── */}
              <div className="text-[10px] text-(--foreground-muted) bg-(--surface-2) border border-(--border) rounded px-2.5 py-1.5">
                <span className="font-semibold text-(--foreground)">Estimated Impact: </span>
                {activeAnalysis.estimatedImpact}
              </div>

              {/* ── Recommendation Cards ────────────────────────────── */}
              {activeRecommendations.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-(--foreground) uppercase tracking-wide font-mono">
                      Tactical Recommendations
                    </span>
                    {executedCount > 0 && (
                      <span className="text-[9px] text-(--primary) font-mono">
                        {executedCount} dispatched
                      </span>
                    )}
                  </div>
                  {activeRecommendations.map((rec) => (
                    <DecisionCard
                      key={rec.id}
                      recommendation={rec}
                      onExecute={() => onDispatch(activeIncident.id, rec.id)}
                      onDismiss={() => onDismiss(activeIncident.id, rec.id)}
                    />
                  ))}
                </div>
              )}

              {/* All cleared */}
              {activeRecommendations.length === 0 && (
                <div className="flex flex-col items-center py-4 text-center border border-dashed border-(--border) rounded-md bg-(--surface-2)">
                  <Sparkles size={16} className="text-(--primary) opacity-40 mb-1.5" aria-hidden="true" />
                  <p className="text-[10px] font-semibold text-(--foreground)">All recommendations cleared</p>
                  <p className="text-[9px] text-(--foreground-subtle) mt-0.5">
                    No pending actions for this incident.
                  </p>
                </div>
              )}
            </m.div>
          ) : (
            <m.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-40 text-center"
            >
              <Brain size={24} className="text-(--primary) opacity-30 mb-2" aria-hidden="true" />
              <p className="text-xs font-semibold text-(--foreground)">Select an incident</p>
              <p className="text-[10px] text-(--foreground-subtle) mt-1 leading-relaxed max-w-44">
                Click an incident in the queue or a marker on the stadium map to view AI analysis.
              </p>
              <button
                className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-(--primary) hover:underline"
                onClick={() => {/* noop — prompt to click incident list */}}
                aria-label="Instructions: click an incident"
              >
                <span>Choose an incident to begin</span>
                <ArrowRight size={10} aria-hidden="true" />
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
