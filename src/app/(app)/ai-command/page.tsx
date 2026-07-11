'use client';

/**
 * AI Command Center Page — /ai-command
 *
 * Two interaction modes:
 *  1. Structured: Select incident/zone/domain → click Analyze
 *  2. Free-form: Type any operational question → submit
 *
 * Both modes funnel through:
 *   contextBuilder.service.ts → assistantStore.submitQuery → /api/assistant → Groq
 *
 * Activity Feed integration: dispatching a recommendation calls useIncidentStore.addActivity
 *
 * Accessibility:
 *  - Response area wrapped in aria-live="polite" region
 *  - All interactive elements keyboard-operable
 *  - Analyzing button aria-disabled during requests
 *
 * See ARCHITECTURE.md — AI Layer, Store Layer, Service Layer
 * See DESIGN.md — Design Philosophy (trust, clarity, speed, precision)
 */

import { useState, useCallback } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Layers, MessageCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAssistantStore } from '@/store/modules/assistant';
import { useIncidentStore } from '@/store/modules/incident';
import { useUIStore } from '@/store/modules/ui';

import { CommandCenterHeader } from '@/components/ai/CommandCenterHeader';
import { ContextSelector } from '@/components/ai/ContextSelector';
import { QueryInput } from '@/components/ai/QueryInput';
import { AIResponseCard } from '@/components/ai/AIResponseCard';
import { ConversationHistory } from '@/components/ai/ConversationHistory';
import { AnalyzingState } from '@/components/ai/AnalyzingState';
import { CommandCenterEmpty } from '@/components/ai/CommandCenterEmpty';
import { CommandCenterError } from '@/components/ai/CommandCenterError';
import { OperationalConsoleStatus } from '@/components/ai/OperationalConsoleStatus';

import type { AssistantDomain } from '@/types/assistant';
import type { StructuredMode } from '@/components/ai/ContextSelector';

type InteractionMode = 'structured' | 'freeform';
type ResponseAreaState = 'empty' | 'analyzing' | 'error' | 'response';

const MODE_TABS: { value: InteractionMode; label: string; icon: React.ReactNode }[] = [
  { value: 'structured', label: 'Structured', icon: <Layers size={12} aria-hidden="true" /> },
  { value: 'freeform', label: 'Free-form', icon: <MessageCircle size={12} aria-hidden="true" /> },
];

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  hi: 'हिंदी',
};

export default function AICommandPage() {
  // ── Store access ─────────────────────────────────────────────────────────────
  const { lastResponse, isAnalyzing, error, conversationHistory, submitQuery, clearError } =
    useAssistantStore();
  const { incidents, addActivity, addToast, activities } = useIncidentStore();
  const language = useUIStore((state) => state.language);

  // Filter AI Command dispatches for the idle state recent activity strip
  const aiActivities = activities
    .filter((act) => act.actor === 'AI Command Center')
    .slice(-3)
    .reverse();

  // ── Interaction mode state ────────────────────────────────────────────────────
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('structured');

  // Structured mode selections
  const [structuredMode, setStructuredMode] = useState<StructuredMode>('incident');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<AssistantDomain | null>(null);

  // Separate query text states for free-form and structured context to prevent leaks
  const [freeformQueryText, setFreeformQueryText] = useState('');
  const [structuredContextText, setStructuredContextText] = useState('');

  // Clear selections when switching top-level modes
  const handleInteractionModeChange = useCallback((mode: InteractionMode) => {
    setInteractionMode(mode);
    setSelectedIncidentId(null);
    setSelectedZoneId(null);
    setSelectedDomain(null);
    setFreeformQueryText('');
    setStructuredContextText('');
  }, []);

  // Clear previous selections when switching Structured mode tabs
  const handleStructuredModeChange = useCallback((mode: StructuredMode) => {
    setStructuredMode(mode);
    setSelectedIncidentId(null);
    setSelectedZoneId(null);
    setSelectedDomain(null);
  }, []);

  // Pre-fill query suggestions from the idle panel and configure structured context
  const handleSelectExampleQuery = useCallback((
    query: string,
    mode: 'freeform' | 'structured',
    structuredTab?: StructuredMode,
    selectionValue?: string
  ) => {
    setInteractionMode(mode);
    setSelectedIncidentId(null);
    setSelectedZoneId(null);
    setSelectedDomain(null);

    if (mode === 'structured' && structuredTab) {
      setStructuredMode(structuredTab);
      if (structuredTab === 'incident') {
        setSelectedIncidentId(selectionValue || null);
      } else if (structuredTab === 'zone') {
        setSelectedZoneId(selectionValue || null);
      } else if (structuredTab === 'domain') {
        setSelectedDomain((selectionValue as AssistantDomain) || null);
      }
      setStructuredContextText(query);
      setFreeformQueryText('');
    } else {
      setFreeformQueryText(query);
      setStructuredContextText('');
    }
  }, []);

  // ── Derived values ────────────────────────────────────────────────────────────
  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) ?? null;

  const isContextSelected = 
    (structuredMode === 'incident' && selectedIncidentId !== null) ||
    (structuredMode === 'zone' && selectedZoneId !== null) ||
    (structuredMode === 'domain' && selectedDomain !== null);

  const canSubmit = 
    interactionMode === 'freeform'
      ? freeformQueryText.trim().length > 0
      : isContextSelected;

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (isAnalyzing) return;

    if (interactionMode === 'structured') {
      const mode: 'incident' | 'zone' | 'domain' = structuredMode;
      submitQuery({
        mode,
        rawQuery: structuredContextText,
        incident: selectedIncident,
        zoneId: selectedZoneId,
        domain: selectedDomain ?? undefined,
        persona: 'operations',
      });
      setStructuredContextText('');
    } else {
      if (!freeformQueryText.trim()) return;
      submitQuery({
        mode: 'freeform',
        rawQuery: freeformQueryText,
        persona: 'operations',
      });
      setFreeformQueryText('');
    }
  }, [
    isAnalyzing,
    interactionMode,
    structuredMode,
    freeformQueryText,
    structuredContextText,
    selectedIncident,
    selectedZoneId,
    selectedDomain,
    submitQuery,
    setStructuredContextText,
    setFreeformQueryText,
  ]);

  const handleDispatchAction = useCallback(
    (actionText: string) => {
      try {
        addActivity(
          `AI Dispatch: ${actionText.slice(0, 80)}${actionText.length > 80 ? '…' : ''}`,
          'AI Command Center',
          'high'
        );
        addToast('Action successfully dispatched to Ops Timeline', 'success');
      } catch (err: unknown) {
        addToast(`Failed to dispatch: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
      }
    },
    [addActivity, addToast]
  );

  const handleRetry = useCallback(() => {
    clearError();
    handleSubmit();
  }, [clearError, handleSubmit]);

  // ── Determine response area content ──────────────────────────────────────────
  let responseAreaState: ResponseAreaState = 'empty';
  if (isAnalyzing) responseAreaState = 'analyzing';
  else if (error) responseAreaState = 'error';
  else if (lastResponse) responseAreaState = 'response';

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0 pt-4 px-6 pb-6 max-w-7xl mx-auto w-full">
      {/* Page header */}
      <CommandCenterHeader />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(380px,1fr)_1.5fr] xl:grid-cols-[minmax(420px,1fr)_1.5fr] gap-6 flex-1 min-h-0">
        {/* ── LEFT PANEL — Query ─────────────────────────────────────────────── */}
        <aside
          className="flex flex-col gap-4 bg-(--surface-1) border border-(--border) rounded-xl p-4 shadow-sm min-h-0"
          aria-label="AI query panel"
        >
          {/* Interaction mode tabs */}
          <div
            role="tablist"
            aria-label="Select interaction mode"
            className="flex rounded-md border border-(--border) bg-(--surface-2) p-0.5 gap-0.5"
          >
            {MODE_TABS.map(({ value, label, icon }) => {
              const isActive = interactionMode === value;
              return (
                <button
                  key={value}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => handleInteractionModeChange(value)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 py-1.5 px-3',
                    'rounded-sm text-[10px] font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-(--surface-1) text-(--foreground) shadow-sm border border-(--border)'
                      : 'text-(--foreground-muted) hover:text-(--foreground) hover:bg-(--surface-3)'
                  )}
                >
                  {icon}
                  {label}
                </button>
              );
            })}
          </div>

          {/* Context selector (structured mode only) */}
          <AnimatePresence initial={false} mode="wait">
            {interactionMode === 'structured' && (
              <m.div
                key="structured"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'visible' }}
              >
                <ContextSelector
                  selectedMode={structuredMode}
                  onModeChange={handleStructuredModeChange}
                  selectedIncidentId={selectedIncidentId}
                  onIncidentChange={setSelectedIncidentId}
                  selectedZoneId={selectedZoneId}
                  onZoneChange={setSelectedZoneId}
                  selectedDomain={selectedDomain}
                  onDomainChange={setSelectedDomain}
                />
              </m.div>
            )}
          </AnimatePresence>

          {/* Query input */}
          <QueryInput
            value={interactionMode === 'freeform' ? freeformQueryText : structuredContextText}
            onChange={interactionMode === 'freeform' ? setFreeformQueryText : setStructuredContextText}
            onSubmit={handleSubmit}
            isAnalyzing={isAnalyzing}
            canSubmit={canSubmit}
            rows={interactionMode === 'structured' ? 2 : 3}
            placeholder={
              interactionMode === 'freeform'
                ? 'Ask any operational question…'
                : 'Optional: add context to this analysis…'
            }
            label={interactionMode === 'freeform' ? 'Operational Query' : 'Additional Context (Optional)'}
            inputId={interactionMode === 'freeform' ? 'freeform-query' : 'structured-context'}
          />
                   {/* Operational Status Readout */}
          <OperationalConsoleStatus
            interactionMode={interactionMode}
            isAnalyzing={isAnalyzing}
          />

          {/* Divider */}
          <div className="border-t border-(--border)" role="separator" />

          {/* Session history (in query panel) */}
          <ConversationHistory messages={conversationHistory} />
        </aside>

        {/* ── RIGHT PANEL — Response (aria-live region) ─────────────────────── */}
        <main
          aria-label="AI response area"
          aria-live="polite"
          aria-atomic="false"
          className={cn(
            "flex flex-col gap-4 bg-(--surface-1) border border-(--border) rounded-xl p-5 shadow-sm min-w-0 min-h-0",
            responseAreaState === 'empty' ? 'overflow-hidden' : 'overflow-y-auto'
          )}
        >
          <AnimatePresence mode="wait">
            {responseAreaState === 'empty' && (
              <m.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CommandCenterEmpty
                  onSelectExample={handleSelectExampleQuery}
                  onSelectMode={setInteractionMode}
                  recentActivities={aiActivities}
                />
              </m.div>
            )}

            {responseAreaState === 'analyzing' && (
              <m.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
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
                transition={{ duration: 0.2 }}
              >
                <CommandCenterError error={error} onRetry={handleRetry} />
              </m.div>
            )}

            {responseAreaState === 'response' && lastResponse && (
              <m.div
                key="response"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between px-1 text-[9px] font-mono text-(--foreground-subtle)">
                  <span>AI Command Output</span>
                  <span>Responses shown in: <span className="font-bold text-(--primary) uppercase">{LANGUAGE_LABELS[language] || language}</span></span>
                </div>
                <AIResponseCard
                  response={lastResponse}
                  onDispatchAction={handleDispatchAction}
                />
              </m.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
