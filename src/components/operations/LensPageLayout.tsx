'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Sparkles, Brain, CheckCircle, Activity, Wifi } from 'lucide-react';
import { cn } from '@/utils/cn';

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

import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ErrorState } from '@/components/shared/ErrorState';
import { useIncidentStore } from '@/store/modules/incident';
import { useAssistantStore } from '@/store/modules/assistant';
import { useUIStore } from '@/store/modules/ui';
import { IncidentRow } from './CriticalIncidents';
import { AnalyzingState } from '@/components/ai/AnalyzingState';
import { CommandCenterError } from '@/components/ai/CommandCenterError';
import { AIResponseCard } from '@/components/ai/AIResponseCard';
import type { SystemStatusLevel } from '@/types/common';
import type { AssistantDomain } from '@/types/assistant';

interface LensPageLayoutProps {
  domain: AssistantDomain;
  title: string;
  description: string;
  statusPills: { label: string; level: SystemStatusLevel }[];
  footerConsoleStatusText: string;
  metrics: React.ReactNode;
  mainContent: React.ReactNode;
  alertContent: React.ReactNode;
  incidentFilter: (incident: import('@/types/incident').Incident) => boolean;
}

export function LensPageLayout({
  domain,
  title,
  description,
  statusPills,
  footerConsoleStatusText,
  metrics,
  mainContent,
  alertContent,
  incidentFilter,
}: LensPageLayoutProps) {
  // ── Store access ─────────────────────────────────────────────────────────────
  const { incidents, activeIncidentId, setActiveIncidentId, addActivity, addToast } = useIncidentStore();
  const { lastResponse, isAnalyzing, error, submitQuery, clearHistory, clearError } = useAssistantStore();

  // Local state to keep AI briefings isolated per page
  const [activeQueryDomain, setActiveQueryDomain] = useState<AssistantDomain | null>(null);
  
  // Read global telemetry fault flag from UIStore (controlled by Settings page)
  const telemetryFaultActive = useUIStore((s) => s.telemetryFaultActive);

  // Clear previous AI briefings on mount to avoid cross-contamination
  useEffect(() => {
    clearHistory();
  }, [clearHistory]);

  // Filter incidents for this specific domain
  const filteredIncidents = incidents.filter(incidentFilter);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleAskAI = useCallback(() => {
    if (isAnalyzing) return;
    clearError();
    setActiveQueryDomain(domain);
    
    // Scopes request to current domain
    submitQuery({
      mode: 'domain',
      domain: domain,
      rawQuery: `Provide a full ${domain} domain operational briefing across the stadium.`,
      persona: 'operations',
    });
  }, [domain, isAnalyzing, clearError, submitQuery]);

  const handleRetryAI = useCallback(() => {
    handleAskAI();
  }, [handleAskAI]);

  const handleClearAI = useCallback(() => {
    clearHistory();
    setActiveQueryDomain(null);
  }, [clearHistory]);

  const handleDispatchAction = useCallback(
    (actionText: string) => {
      try {
        addActivity(
          `Tactical Action Dispatched: ${actionText.slice(0, 80)}${actionText.length > 80 ? '…' : ''}`,
          `${domain.toUpperCase()} Operator`,
          'high'
        );
        addToast('Response action successfully dispatched', 'success');
      } catch (err: unknown) {
        addToast(`Dispatch failed: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
      }
    },
    [domain, addActivity, addToast]
  );

  // Determine Response Area State
  type ResponseAreaState = 'idle' | 'analyzing' | 'error' | 'response';
  let responseAreaState: ResponseAreaState = 'idle';
  
  if (activeQueryDomain === domain) {
    if (isAnalyzing) responseAreaState = 'analyzing';
    else if (error) responseAreaState = 'error';
    else if (lastResponse) responseAreaState = 'response';
  }

  return (
    <PageContainer>
      <div className="space-y-(--card-gap) animate-fade-in pb-10">
        {/* Main console container */}
        <div className="bg-(--surface-1) border border-(--border) rounded-card p-6 min-h-160 flex flex-col justify-between shadow-sm">
          
          {/* Header area */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-(--border) pb-5 mb-5">
            <SectionHeader
              title={title}
              description={description}
              className="mb-0!"
              titleClassName="text-base font-semibold tracking-tight"
            />
            
            {/* Status pills */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {statusPills.map((pill, idx) => (
                <StatusBadge key={idx} level={pill.level} label={pill.label} />
              ))}
            </div>
          </div>

          {telemetryFaultActive ? (
            <div className="flex-1 flex items-center justify-center p-6 my-6">
              <ErrorState
                title="Telemetry Feed Disconnected"
                message="Loss of live SCADA telemetry packages. Verify switch configurations or retry network socket bind."
                onRetry={() => useUIStore.getState().setTelemetryFault(false)}
                className="max-w-md w-full"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-6 my-2">
              
              {/* Metrics Row (Full Width) */}
              <div className="w-full shrink-0">
                {metrics}
              </div>

              {/* Row 1: Main Content & Domain Incident Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-stretch min-h-0">
                <div className="min-w-0 h-full flex flex-col" role="region" aria-label="Live Domain Telemetry">
                  {mainContent}
                </div>

                {/* Domain Incident Queue */}
                <div className="bg-(--surface-2)/45 border border-(--border) rounded-xl p-4 flex flex-col h-full min-h-80 min-w-0 shadow-sm" role="region" aria-label="Domain Incident Queue">
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider">
                      Domain Incident Queue
                    </h3>
                    <span className="text-[10px] font-mono font-semibold text-(--foreground-subtle)">
                      {filteredIncidents.length} active
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-h-0">
                    <div className="overflow-y-auto pr-0.5 min-h-0 flex-1">
                      {filteredIncidents.length > 0 ? (
                        <ul className="space-y-2" role="list" aria-label="Filtered incident queue">
                          <AnimatePresence initial={false}>
                            {filteredIncidents.map((incident) => (
                              <IncidentRow
                                key={incident.id}
                                incident={incident}
                                isSelected={activeIncidentId === incident.id}
                                onSelect={() => setActiveIncidentId(incident.id)}
                              />
                            ))}
                          </AnimatePresence>
                        </ul>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                          <CheckCircle size={24} className="text-(--primary) opacity-50 mb-2" />
                          <p className="text-xs font-semibold text-(--foreground)">Queue Clear</p>
                          <p className="text-[10px] text-(--foreground-subtle) mt-0.5">
                            No active incidents reported in this operational sector.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Telemetry Status Summary (fills dead space when incident queue is short) */}
                    <div className="mt-4 pt-3 border-t border-(--border) space-y-2.5 shrink-0 text-left">
                      <div className="flex items-center justify-between text-[7.5px] font-mono text-(--foreground-subtle) uppercase tracking-wider">
                        <span>Operational Telemetry</span>
                        <span className="text-(--color-success) flex items-center gap-1 font-bold">
                          <span className="w-1 h-1 rounded-full bg-(--color-success) live-indicator" />
                          Feeds Active
                        </span>
                      </div>
                      
                      {domain === 'transport' ? (
                        <>
                          {/* Transport-Specific Telemetry */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-(--surface-1)/75 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
                              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Monitored Hubs</span>
                              <span className="text-[11px] font-extrabold text-(--foreground) mt-0.5 block">4 Active Nodes</span>
                            </div>
                            <div className="bg-(--surface-1)/75 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
                              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Dispatch Status</span>
                              <span className="text-[11px] font-extrabold text-(--foreground) mt-0.5 flex items-center gap-0.5">
                                <AnimatedNumber value={96} suffix="%" /> <span className="text-[8.5px] text-(--foreground-subtle) font-normal">On-Time</span>
                              </span>
                            </div>
                          </div>

                          {/* Transport-Specific Activity Logs */}
                          <div className="space-y-1.5">
                            <span className="block text-[7.5px] font-mono text-(--foreground-subtle) uppercase tracking-wider">Recent Activity Logs</span>
                            <div className="text-[9.5px] space-y-2 text-(--foreground-muted) font-sans">
                              <div className="flex items-center gap-2 border-l-2 border-(--primary)/25 pl-2 py-0.5">
                                <Activity size={11} className="text-(--primary) shrink-0" />
                                <span className="truncate leading-snug">Shuttle Route B: <span className="font-semibold text-(--foreground)">Diversion active</span> (Collision reroute)</span>
                              </div>
                              <div className="flex items-center gap-2 border-l-2 border-blue-500/25 pl-2 py-0.5">
                                <Wifi size={11} className="text-blue-500 shrink-0" />
                                <span className="truncate leading-snug">Metro Platform 2: <span className="font-semibold text-(--foreground)">Flow normalized</span> (Egress target met)</span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : domain === 'emergency' ? (
                        <>
                          {/* Emergency-Specific Telemetry */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-(--surface-1)/75 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
                              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Response Readiness</span>
                              <span className="text-[11px] font-extrabold text-(--foreground) mt-0.5 flex items-center gap-0.5">
                                <AnimatedNumber value={98} suffix="%" /> <span className="text-[8.5px] text-(--foreground-subtle) font-normal">Ready</span>
                              </span>
                            </div>
                            <div className="bg-(--surface-1)/75 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
                              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Active Responders</span>
                              <span className="text-[11px] font-extrabold text-(--foreground) mt-0.5 block">240 Staff</span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="block text-[7.5px] font-mono text-(--foreground-subtle) uppercase tracking-wider">Recent Activity Logs</span>
                            <div className="text-[9.5px] space-y-2 text-(--foreground-muted) font-sans">
                              <div className="flex items-center gap-2 border-l-2 border-(--primary)/25 pl-2 py-0.5">
                                <Activity size={11} className="text-(--primary) shrink-0" />
                                <span className="truncate leading-snug">Gate 3 Security Perimeter: <span className="font-semibold text-(--foreground)">Lock confirmed</span> (Auxiliary relay active)</span>
                              </div>
                              <div className="flex items-center gap-2 border-l-2 border-blue-500/25 pl-2 py-0.5">
                                <Wifi size={11} className="text-blue-500 shrink-0" />
                                <span className="truncate leading-snug">Medical Unit 4 Dispatch: <span className="font-semibold text-(--foreground)">Response time 2.1m</span> (Nominal)</span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Crowd-Specific Telemetry */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-(--surface-1)/75 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
                              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Monitored Sectors</span>
                              <span className="text-[11px] font-extrabold text-(--foreground) mt-0.5 block">6 Active Stands</span>
                            </div>
                            <div className="bg-(--surface-1)/75 border border-(--border)/60 rounded-md p-2 shadow-2xs hover:border-(--border-strong) transition-colors">
                              <span className="block text-[7.5px] text-(--foreground-subtle) font-mono tracking-wider uppercase">Scanner Speed</span>
                              <span className="text-[11px] font-extrabold text-(--foreground) mt-0.5 flex items-center gap-0.5">
                                <AnimatedNumber value={94} suffix="%" /> <span className="text-[8.5px] text-(--foreground-subtle) font-normal">Efficiency</span>
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <span className="block text-[7.5px] font-mono text-(--foreground-subtle) uppercase tracking-wider">Recent Activity Logs</span>
                            <div className="text-[9.5px] space-y-2 text-(--foreground-muted) font-sans">
                              <div className="flex items-center gap-2 border-l-2 border-(--primary)/25 pl-2 py-0.5">
                                <Activity size={11} className="text-(--primary) shrink-0" />
                                <span className="truncate leading-snug">Gate 7 scanner flow: <span className="font-semibold text-(--foreground)">12 p/m</span> (Mitigation active)</span>
                              </div>
                              <div className="flex items-center gap-2 border-l-2 border-blue-500/25 pl-2 py-0.5">
                                <Wifi size={11} className="text-blue-500 shrink-0" />
                                <span className="truncate leading-snug">Turnstile connectivity: <span className="font-semibold text-(--foreground)">100% online</span> (RFID check OK)</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex items-center justify-between text-[8px] font-mono text-(--foreground-subtle) bg-(--surface-1)/50 px-2 py-1 rounded border border-(--border)/60">
                        <span>AI Monitoring: <span className="text-(--primary) font-extrabold">ENABLED</span></span>
                        <span suppressHydrationWarning>Scan Time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                      
                      {filteredIncidents.length <= 1 && domain !== 'transport' && (
                        <div className="text-[8.5px] text-center font-mono text-(--foreground-subtle) bg-green-500/3 border border-green-500/10 rounded py-1">
                          No additional incidents detected.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Alert Content & Domain Copilot */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-stretch min-h-0">
                <div className="min-w-0 h-full flex flex-col" role="region" aria-label="Domain Alerts">
                  {alertContent}
                </div>

                {/* Domain Copilot Container */}
                <div
                  className={cn(
                    "flex flex-col min-w-0 transition-all duration-200 h-full",
                    responseAreaState === 'response'
                      ? "space-y-3"
                      : "bg-(--surface-2)/45 border border-(--border) rounded-xl p-4 min-h-60 justify-between shadow-sm"
                  )}
                  role="region"
                  aria-label="Domain Copilot"
                >
                  <div className={cn(
                    "flex items-center justify-between shrink-0",
                    responseAreaState === 'response' ? "border-b border-(--border) pb-2" : "mb-3"
                  )}>
                    <div className="flex items-center gap-1.5">
                      <Brain size={13} className="text-(--primary)" />
                      <h3 className="text-xs font-bold text-(--foreground) uppercase tracking-wider">
                        Domain Copilot
                      </h3>
                    </div>
                    {responseAreaState === 'response' && (
                      <button
                        onClick={handleClearAI}
                        className="text-[9px] font-mono text-(--foreground-muted) hover:text-(--foreground) border border-(--border) px-1.5 py-0.5 rounded bg-(--surface-1) active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                        aria-label="Clear AI response"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className={cn(
                    "flex-1 flex flex-col justify-center min-h-0",
                    responseAreaState === 'idle' && "min-h-40",
                    responseAreaState === 'response' && "overflow-y-auto pr-0.5"
                  )}>
                    <AnimatePresence mode="wait">
                      {responseAreaState === 'idle' && (
                        <m.div
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex flex-col items-center text-center py-4 px-4 h-full justify-between"
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
                          <div className="w-full border-t border-(--border)/60 pt-3 mt-3">
                            <div className="flex items-center justify-center gap-1.5 text-[8.5px] font-mono text-(--foreground-muted) mb-2 uppercase tracking-wider">
                              <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                              <span>Monitoring Cycle: Live</span>
                            </div>
                            <button
                              onClick={handleAskAI}
                              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-(--primary) hover:bg-(--primary-hover) hover:-translate-y-px hover:shadow-md active:scale-[0.98] text-white text-xs font-semibold shadow-sm transition-all duration-150 cursor-pointer"
                              aria-label={`Ask AI about ${domain} operations`}
                            >
                              <Brain size={12} />
                              Ask AI about {domain}
                            </button>
                          </div>
                        </m.div>
                      )}

                      {responseAreaState === 'analyzing' && (
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

                      {responseAreaState === 'error' && error && (
                        <m.div
                          key="error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="w-full"
                        >
                          <CommandCenterError error={error} onRetry={handleRetryAI} />
                        </m.div>
                      )}

                      {responseAreaState === 'response' && lastResponse && (
                        <m.div
                          key="response"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="w-full text-left font-sans space-y-3"
                        >
                          <div className="flex items-center justify-between px-1 text-[9px] font-mono text-(--foreground-subtle)">
                            <span>Domain AI Output</span>
                            <span>Shown in: <span className="font-bold text-(--primary) uppercase">{useUIStore.getState().language}</span></span>
                          </div>
                          <AIResponseCard
                            response={lastResponse}
                            onDispatchAction={handleDispatchAction}
                          />
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status footer */}
          <div className="border-t border-(--border) pt-4 mt-5 flex justify-between text-[10px] font-mono font-semibold tracking-wider uppercase text-(--foreground-muted) opacity-90">
            <span aria-label="Console status">{footerConsoleStatusText}</span>
            <span>FIFA WORLD CUP 2026</span>
          </div>

        </div>
      </div>
    </PageContainer>
  );
}
