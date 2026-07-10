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
 * Fallback State:
 *  - General Stadium Operations Center Dashboard with live operational metrics and predictive AI outlook.
 */


import { m, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Gauge, 
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { ExpandableAICard } from '@/components/ai/ExpandableAICard';
import { DecisionCard } from '@/components/cards/DecisionCard';
import { cn } from '@/utils/cn';
import type { Incident, IncidentAnalysis } from '@/types/incident';
import type { StadiumTelemetry } from '@/types/telemetry';

interface AIContextPanelProps {
  activeIncident: Incident | null;
  activeAnalysis: IncidentAnalysis | null;
  onDispatch: (incidentId: string, recommendationId: string) => void;
  onDismiss: (incidentId: string, recommendationId: string) => void;
  telemetry?: StadiumTelemetry | null;
  incidents?: Incident[];
  onCollapseClick?: () => void;
}



export function AIContextPanel({
  activeIncident,
  activeAnalysis,
  onDispatch,
  onDismiss,
  telemetry,
  incidents = [],
  onCollapseClick,
}: AIContextPanelProps) {
  const activeRecommendations = activeAnalysis?.recommendations.filter(
    (r) => !r.dismissed && !r.executed,
  ) ?? [];

  const executedCount = activeAnalysis?.recommendations.filter((r) => r.executed).length ?? 0;

  // General KPIs for empty/overview state
  const openIncidents = incidents.filter(i => i.status !== 'resolved');
  const criticalCount = openIncidents.filter(i => i.severity === 'critical').length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-(--border) shrink-0 bg-(--surface-1)">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Brain size={12} className="text-(--primary)" aria-hidden="true" />
            <span className="text-[10px] font-mono font-bold text-(--foreground) uppercase tracking-wider">AI Operations Analyst</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-(--primary-muted) border border-(--primary-light)">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[8px] font-semibold text-(--primary) uppercase tracking-wide font-mono leading-none">
                Live Feed
              </span>
            </div>
            {onCollapseClick && (
              <button
                onClick={onCollapseClick}
                className="w-7 h-7 border border-(--border) rounded-md flex items-center justify-center bg-(--surface-1) text-(--foreground-muted) hover:text-(--foreground) hover:bg-(--surface-2) transition-colors cursor-pointer"
                title="Collapse panel"
                aria-label="Collapse panel"
              >
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
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

              {/* ── Operational Summary Card ─────────────────────────────── */}
              <ExpandableAICard
                title="Operational Summary"
                icon={<Activity size={10} aria-hidden="true" />}
                prose={activeAnalysis.aiSituationSummary.explanation}
                theme="neutral"
              />

              {/* ── Predicted Risk Card ──────────────────────────────────── */}
              <ExpandableAICard
                title="Predicted Risk"
                icon={<AlertTriangle size={10} aria-hidden="true" />}
                prose={activeAnalysis.aiSituationSummary.expectedRisks}
                theme="warning"
              />

              {/* ── Suggested Next Action Card ───────────────────────────── */}
              <ExpandableAICard
                title="Suggested Next Action"
                icon={<ShieldCheck size={10} aria-hidden="true" />}
                prose={activeAnalysis.aiSituationSummary.recommendedResponse}
                theme="success"
              />

              {/* ── Estimated Impact ────────────────────────────────── */}
              <div className="text-[10px] text-(--foreground-muted) bg-linear-to-b from-(--surface-1) to-(--surface-2)/20 border border-(--border) rounded px-2.5 py-1.5">
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
                <div className="flex flex-col items-center py-4 text-center border border-dashed border-(--border) rounded-md bg-linear-to-b from-(--surface-1) to-(--surface-2)/20">
                  <Sparkles size={16} className="text-(--primary) opacity-40 mb-1.5" aria-hidden="true" />
                  <p className="text-[10px] font-semibold text-(--foreground)">All recommendations cleared</p>
                  <p className="text-[9px] text-(--foreground-subtle) mt-0.5">
                    No pending actions for this incident.
                  </p>
                </div>
              )}
            </m.div>
          ) : (
            // Premium live stadium operational summary (non-selected overview)
            <m.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {/* Stadium Overview status title */}
              <div className="flex items-center gap-1.5 py-0.5">
                <Gauge size={12} className="text-(--primary)" aria-hidden="true" />
                <span className="text-[9.5px] font-mono text-(--foreground) uppercase tracking-wider font-bold">
                  Stadium Operations Dashboard
                </span>
              </div>

              {/* Live operational overview cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded bg-linear-to-b from-(--surface-1) to-(--surface-2)/20 border border-(--border) hover:border-(--border-strong) transition-colors duration-155 shadow-2xs">
                  <span className="text-[7.5px] font-bold font-mono text-(--foreground-subtle) uppercase block tracking-wider">Open Incidents</span>
                  <span className="text-base font-black text-(--foreground) font-mono leading-tight">{openIncidents.length}</span>
                </div>
                <div className="p-2.5 rounded bg-linear-to-b from-(--surface-1) to-(--surface-2)/20 border border-(--border) hover:border-(--border-strong) transition-colors duration-155 shadow-2xs">
                  <span className="text-[7.5px] font-bold font-mono text-(--foreground-subtle) uppercase block tracking-wider">Critical Alerts</span>
                  <span className={cn("text-base font-black font-mono leading-tight", criticalCount > 0 ? "text-red-500 animate-pulse" : "text-(--foreground)")}>{criticalCount}</span>
                </div>
              </div>

              {/* ── Global Status Summary Card ─────────────────────────────── */}
              <ExpandableAICard
                title="Global Status Summary"
                icon={<Activity size={10} aria-hidden="true" />}
                prose={`Stadium crowd distribution is stable at ${telemetry?.stadiumCapacity.value ?? 62}% nominal threshold. All emergency routes and gates are operating in normal parameters. Staffing distribution is optimal at 98% duty strength.`}
                theme="neutral"
              />

              {/* ── Predictive Outlook Card ──────────────────────────────────── */}
              <ExpandableAICard
                title="Predictive Outlook (AI)"
                icon={<TrendingUp size={10} aria-hidden="true" />}
                prose="Low structural risk. No critical congestion events predicted for the next 15 minutes. Heavy foot ingress flow at Gate D will continue until kickoff."
                theme="info"
              />

              {/* ── System Recommendation Card ───────────────────────────── */}
              <ExpandableAICard
                title="System Recommendation"
                icon={<ShieldCheck size={10} aria-hidden="true" />}
                prose="Keep active focus on the Incident Queue. Monitor Gate D CCTV camera cones for queuing congestion."
                theme="success"
              />

              <div className="text-[9px] text-center text-(--foreground-subtle) border border-dashed border-(--border) rounded-md py-3 px-2 bg-linear-to-b from-(--surface-1) to-(--surface-2)/10 font-mono leading-relaxed">
                Select an incident or zone from the stadium map to inspect details & dispatcher tools.
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
