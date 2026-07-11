'use client';

import { Brain, AlertTriangle, AlertOctagon, Building } from 'lucide-react';
import { DecisionCard } from '@/components/cards/DecisionCard';
import type { Incident, IncidentAnalysis } from '@/types/incident';

interface IncidentDrawerAIIntelligenceProps {
  incident: Incident;
  analysis?: IncidentAnalysis;
  onExecute: (recommendationId: string) => void;
  onDismiss: (recommendationId: string) => void;
}

export function IncidentDrawerAIIntelligence({
  incident,
  analysis,
  onExecute,
  onDismiss,
}: IncidentDrawerAIIntelligenceProps) {
  if (!analysis) return null;

  const activeRecs = analysis.recommendations ? analysis.recommendations.filter(r => !r.dismissed) : [];

  return (
    <div className="space-y-6">
      {/* AI Situation Summary Section */}
      <div className="border border-(--primary) border-opacity-30 rounded-md p-4 bg-green-50/20 dark:bg-green-950/5 relative overflow-hidden">
        {/* Visual Accent */}
        <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
          <Brain size={80} className="text-(--primary)" />
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <Brain size={14} className="text-(--primary)" />
          <h4 className="text-xs font-bold text-(--primary) uppercase tracking-wider">
            AI Situation Intelligence
          </h4>
          {incident.aiConfidence && (
            <span className="ml-auto text-[9px] font-bold bg-(--primary-light) dark:bg-green-900/40 text-(--primary) dark:text-green-300 px-1.5 py-0.5 rounded font-mono">
              {incident.aiConfidence}% System Confidence
            </span>
          )}
        </div>

        <div className="space-y-3.5 text-[11px] leading-relaxed text-(--foreground-muted)">
          <div>
            <span className="font-semibold text-(--foreground) block">Situation Overview</span>
            <p className="mt-0.5">{analysis.aiSituationSummary.explanation}</p>
          </div>
          <div>
            <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertTriangle size={11} /> Expected Operations Risks
            </span>
            <p className="mt-0.5">{analysis.aiSituationSummary.expectedRisks}</p>
          </div>
          <div>
            <span className="font-semibold text-(--primary) block">Recommended Tactical Response</span>
            <p className="mt-0.5 text-(--foreground) font-medium">{analysis.aiSituationSummary.recommendedResponse}</p>
          </div>
        </div>
      </div>

      {/* AI Decision Cards (Recommendations) */}
      {activeRecs.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-(--foreground) flex items-center gap-1 border-b border-(--border) pb-2">
            <AlertOctagon size={12} className="text-(--primary)" /> AI Tactical Recommendations
          </h4>
          <div className="space-y-3">
            {activeRecs.map((rec) => (
              <DecisionCard
                key={rec.id}
                recommendation={rec}
                onExecute={() => onExecute(rec.id)}
                onDismiss={() => onDismiss(rec.id)}
                isIncidentResolved={incident.status === 'resolved'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Impact & Nearby Facilities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Estimated Impact */}
        <div className="border border-(--border) rounded-md p-4 bg-(--surface-2)">
          <h4 className="text-xs font-semibold text-(--foreground) mb-2">Estimated Operational Impact</h4>
          <p className="text-[11px] text-(--foreground-muted) leading-relaxed">
            {analysis.estimatedImpact}
          </p>
        </div>

        {/* Nearby Facilities */}
        <div className="border border-(--border) rounded-md p-4 bg-(--surface-2)">
          <h4 className="text-xs font-semibold text-(--foreground) mb-2">Nearest Response Facilities</h4>
          <ul className="space-y-2" aria-label="Nearby facilities">
            {analysis.nearbyFacilities.map((fac) => (
              <li key={fac.name} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-(--foreground-muted)">
                  <Building size={11} className="text-(--foreground-subtle)" />
                  {fac.name}
                </span>
                <span className="font-semibold font-mono text-(--foreground)">{fac.distance}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
