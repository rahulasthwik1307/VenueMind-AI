'use client';

import { Brain, Sparkles, ShieldAlert, HeartPulse, Bus, ArrowRight, HelpCircle, Shield, Activity, Users, Building, Cloud, HeartHandshake, Accessibility } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { SkeletonCard } from '@/components/shared/SkeletonCard';
import { useIncident } from '@/hooks/useIncident';
import { DecisionCard } from '@/components/cards/DecisionCard';

// Category Icon helper for idle briefing
const CATEGORY_ICONS: Record<string, typeof Shield> = {
  security: Shield,
  medical: Activity,
  transport: Bus,
  volunteer: HeartHandshake,
  accessibility: Accessibility,
  crowd: Users,
  infrastructure: Building,
  weather: Cloud,
};

export function AIRecommendations() {
  const { activeIncidentId, incidents, analyses, dispatchAction, setActiveIncidentId, dismissRecommendation } = useIncident();
  const isLoading = false;

  const activeIncident = incidents.find((inc) => inc.id === activeIncidentId);
  const analysis = activeIncident ? analyses[activeIncident.id] : null;

  // Filter recommendations that are NOT dismissed
  const activeRecommendations = analysis && analysis.recommendations
    ? analysis.recommendations.filter(r => !r.dismissed)
    : [];

  // Calculate briefing stats for the idle state
  const totalActive = incidents.filter((i) => i.status !== 'resolved').length;
  const criticalActive = incidents.filter((i) => i.severity === 'critical' && i.status !== 'resolved').length;
  const medicalActive = incidents.filter((i) => i.category === 'medical' && i.status !== 'resolved').length;
  const transportActive = incidents.filter((i) => i.category === 'transport' && i.status !== 'resolved').length;

  // Find the highest priority active incident
  const sortedActive = [...incidents]
    .filter((i) => i.status !== 'resolved')
    .sort((a, b) => {
      const weight = { critical: 4, high: 3, medium: 2, low: 1 };
      return weight[b.severity] - weight[a.severity];
    });

  const highestPriorityIncident = sortedActive[0];
  const highestPriorityAnalysis = highestPriorityIncident ? analyses[highestPriorityIncident.id] : null;
  const primaryRec = highestPriorityAnalysis?.recommendations.find(r => !r.executed && !r.dismissed);

  const HighestPriorityIcon = (highestPriorityIncident && CATEGORY_ICONS[highestPriorityIncident.category]) || HelpCircle;

  return (
    <section
      className={cn(
        'bg-(--surface-1) border border-(--border) rounded-card p-5 flex flex-col min-h-120'
      )}
      aria-label="AI operations panel"
    >
      <SectionHeader
        title="VenueMind AI"
        description="Real-time suggested operational responses"
        action={
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-(--primary-muted) border border-(--primary-light)"
            aria-label="AI online"
          >
            <Sparkles size={10} strokeWidth={1.75} className="text-(--primary)" aria-hidden="true" />
            <span className="text-[9px] font-semibold text-(--primary) uppercase tracking-wide font-mono">
              Online
            </span>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto pr-0.5">
        {isLoading ? (
          <div className="space-y-3">
            <SkeletonCard lines={3} hasHeader={false} />
            <SkeletonCard lines={3} hasHeader={false} />
          </div>
        ) : activeIncident ? (
          activeRecommendations.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-mono text-(--foreground-subtle) uppercase tracking-wider">
                  Incident: {activeIncident.id.toUpperCase()} · {activeIncident.title}
                </span>
                <span className="text-[9px] font-bold text-(--primary) font-mono uppercase bg-(--primary-muted) px-1.5 py-0.5 rounded border border-(--primary-light)">
                  {activeIncident.aiConfidence}% Confidence
                </span>
              </div>
              <div className="space-y-3">
                {activeRecommendations.map((rec) => (
                  <DecisionCard
                    key={rec.id}
                    recommendation={rec}
                    onExecute={() => dispatchAction(activeIncident.id, rec.id)}
                    onDismiss={() => dismissRecommendation(activeIncident.id, rec.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center border border-dashed border-(--border) rounded-lg bg-(--surface-2)">
              <Brain size={24} className="text-(--primary) opacity-40 mb-2" />
              <p className="text-xs font-semibold text-(--foreground)">Tactical Recommendations Cleared</p>
              <p className="text-[10px] text-(--foreground-subtle) mt-0.5 max-w-70 leading-relaxed mx-auto">
                All recommendations for this incident have been executed or dismissed. Telemetry reports nominal.
              </p>
            </div>
          )
        ) : (
          /* Premium AI Briefing Idle State */
          <div className="flex flex-col h-full justify-between space-y-5">
            <div className="space-y-4">
              <div className="bg-(--surface-2) border border-(--border) rounded-md p-4 flex items-start gap-3">
                <Brain size={24} className="text-(--primary) shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-(--foreground)">VenueMind AI is ready.</h4>
                  <p className="text-[11px] text-(--foreground-muted) leading-relaxed">
                    Good morning. VenueMind AI is waiting for your next operational decision. I am currently monitoring Al Bayt Stadium telemetry feeds.
                  </p>
                </div>
              </div>

              {/* Counts Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Active Incidents', value: totalActive, icon: ShieldAlert, color: 'text-orange-500' },
                  { label: 'Critical Errors', value: criticalActive, icon: ShieldAlert, color: 'text-red-500' },
                  { label: 'Medical Dispatches', value: medicalActive, icon: HeartPulse, color: 'text-red-500' },
                  { label: 'Transport Delays', value: transportActive, icon: Bus, color: 'text-indigo-500' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-(--surface-2) border border-(--border) rounded p-2.5 flex flex-col justify-between min-h-16">
                    <span className="text-[9px] text-(--foreground-subtle) leading-tight">{stat.label}</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-sm font-bold text-(--foreground) font-mono">{stat.value}</span>
                      <stat.icon size={11} className={stat.color} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Highest Priority Alert Briefing Box */}
            {highestPriorityIncident ? (
              <div className="border border-red-500/20 bg-red-50/10 dark:bg-red-950/5 rounded-md p-4 space-y-3">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-red-600 dark:text-red-400" />
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider font-mono">
                    Highest Priority Alert
                  </span>
                  <span className="ml-auto text-[9px] font-bold text-red-600 dark:text-red-400 font-mono bg-red-50 dark:bg-red-950 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900">
                    {highestPriorityIncident.aiConfidence}% CF
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded bg-red-100 dark:bg-red-950 flex items-center justify-center shrink-0 text-red-600 dark:text-red-400 mt-0.5">
                    <HighestPriorityIcon size={12} />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-(--foreground) leading-snug">
                      {highestPriorityIncident.title}
                    </h5>
                    <p className="text-[10px] text-(--foreground-muted) mt-1 leading-relaxed">
                      {highestPriorityIncident.description}
                    </p>
                  </div>
                </div>

                {primaryRec && (
                  <div className="border-t border-(--border) pt-2.5 text-[10px] space-y-1">
                    <p className="text-(--foreground-muted)">
                      Suggested Response: <span className="font-semibold text-(--foreground)">{primaryRec.title}</span>
                    </p>
                    <p className="text-[9px] text-(--foreground-subtle) leading-snug">
                      Expected Impact: {primaryRec.expectedImpact}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setActiveIncidentId(highestPriorityIncident.id)}
                  className="w-full flex items-center justify-center gap-1.5 text-[10px] font-semibold text-white bg-red-600 hover:bg-red-700 py-1.5 rounded transition-colors duration-150"
                >
                  <span>Review Incident Analysis</span>
                  <ArrowRight size={10} />
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-(--border) bg-(--surface-2) rounded-md p-4 text-center text-[10px] text-(--foreground-subtle) py-8">
                All operational zones reports nominal. No active triage required.
              </div>
            )}
          </div>
        )}
      </div>

      {activeIncident && (
        <div className="mt-3 border-t border-(--border) pt-3 shrink-0 flex justify-between text-[9px] font-mono text-(--foreground-subtle)">
          <span>TACTICAL ENGINE V1.2.0</span>
          <span>FIFA COPT CONSOLE</span>
        </div>
      )}
    </section>
  );
}
