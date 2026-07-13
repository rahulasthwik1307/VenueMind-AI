'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Brain, CheckCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

import { PageContainer } from '@/components/layout/PageContainer';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ErrorState } from '@/components/shared/ErrorState';
import { useShallow } from 'zustand/shallow';
import { useIncidentStore } from '@/store/modules/incident';
import { useAssistantStore } from '@/store/modules/assistant';
import { useUIStore } from '@/store/modules/ui';
import { IncidentRow } from './CriticalIncidents';
import { AnalyzingState } from '@/components/ai/AnalyzingState';
import { CommandCenterError } from '@/components/ai/CommandCenterError';
import { AIResponseCard } from '@/components/ai/AIResponseCard';
import { DomainTelemetryStatus } from './DomainTelemetryStatus';
import { CopilotIdlePanel } from './CopilotIdlePanel';

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

type ResponseAreaState = 'idle' | 'analyzing' | 'error' | 'response';

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
  const { incidents, activeIncidentId, setActiveIncidentId, addActivity, addToast } = useIncidentStore(
    useShallow((state) => ({
      incidents: state.incidents,
      activeIncidentId: state.activeIncidentId,
      setActiveIncidentId: state.setActiveIncidentId,
      addActivity: state.addActivity,
      addToast: state.addToast,
    }))
  );
  const { lastResponse, isAnalyzing, error, submitQuery, clearHistory, clearError } = useAssistantStore(
    useShallow((state) => ({
      lastResponse: state.lastResponse,
      isAnalyzing: state.isAnalyzing,
      error: state.error,
      submitQuery: state.submitQuery,
      clearHistory: state.clearHistory,
      clearError: state.clearError,
    }))
  );

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
                    <DomainTelemetryStatus
                      domain={domain}
                      filteredIncidents={filteredIncidents}
                    />
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
                        <CopilotIdlePanel
                          domain={domain}
                          onAskAI={handleAskAI}
                        />
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
