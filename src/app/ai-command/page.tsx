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

import { CommandCenterHeader } from '@/components/ai/CommandCenterHeader';
import { ContextSelector } from '@/components/ai/ContextSelector';
import { QueryInput } from '@/components/ai/QueryInput';
import { AIResponseCard } from '@/components/ai/AIResponseCard';
import { ConversationHistory } from '@/components/ai/ConversationHistory';
import { AnalyzingState } from '@/components/ai/AnalyzingState';
import { CommandCenterEmpty } from '@/components/ai/CommandCenterEmpty';
import { CommandCenterError } from '@/components/ai/CommandCenterError';

import type { AssistantDomain } from '@/types/assistant';
import type { StructuredMode } from '@/components/ai/ContextSelector';

type InteractionMode = 'structured' | 'freeform';

const MODE_TABS: { value: InteractionMode; label: string; icon: React.ReactNode }[] = [
  { value: 'structured', label: 'Structured', icon: <Layers size={12} aria-hidden="true" /> },
  { value: 'freeform', label: 'Free-form', icon: <MessageCircle size={12} aria-hidden="true" /> },
];

export default function AICommandPage() {
  // ── Store access ─────────────────────────────────────────────────────────────
  const { lastResponse, isAnalyzing, error, conversationHistory, submitQuery, clearError } =
    useAssistantStore();
  const { incidents, addActivity } = useIncidentStore();

  // ── Interaction mode state ────────────────────────────────────────────────────
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('structured');

  // Structured mode selections
  const [structuredMode, setStructuredMode] = useState<StructuredMode>('incident');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<AssistantDomain | null>(null);

  // Shared query text (used in both modes)
  const [queryText, setQueryText] = useState('');

  // ── Derived values ────────────────────────────────────────────────────────────
  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) ?? null;

  const isContextSelected = 
    (structuredMode === 'incident' && selectedIncidentId !== null) ||
    (structuredMode === 'zone' && selectedZoneId !== null) ||
    (structuredMode === 'domain' && selectedDomain !== null);

  const canSubmit = 
    interactionMode === 'freeform'
      ? queryText.trim().length > 0
      : isContextSelected;

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (isAnalyzing) return;

    if (interactionMode === 'structured') {
      const mode: 'incident' | 'zone' | 'domain' = structuredMode;
      submitQuery({
        mode,
        rawQuery: queryText,
        incident: selectedIncident,
        zoneId: selectedZoneId,
        domain: selectedDomain ?? undefined,
        persona: 'operations',
      });
    } else {
      if (!queryText.trim()) return;
      submitQuery({
        mode: 'freeform',
        rawQuery: queryText,
        persona: 'operations',
      });
      setQueryText('');
    }
  }, [
    isAnalyzing,
    interactionMode,
    structuredMode,
    queryText,
    selectedIncident,
    selectedZoneId,
    selectedDomain,
    submitQuery,
  ]);

  const handleDispatchAction = useCallback(
    (actionText: string) => {
      addActivity(
        `AI Command: ${actionText.slice(0, 80)}${actionText.length > 80 ? '…' : ''}`,
        'AI Command Center',
        'high'
      );
    },
    [addActivity]
  );

  const handleRetry = useCallback(() => {
    clearError();
    handleSubmit();
  }, [clearError, handleSubmit]);

  // ── Determine response area content ──────────────────────────────────────────
  type ResponseAreaState = 'empty' | 'analyzing' | 'error' | 'response';
  let responseAreaState: ResponseAreaState = 'empty';
  if (isAnalyzing) responseAreaState = 'analyzing';
  else if (error) responseAreaState = 'error';
  else if (lastResponse) responseAreaState = 'response';

  return (
    <div className="flex flex-col gap-6 h-full p-6 max-w-[1400px] mx-auto">
      {/* Page header */}
      <CommandCenterHeader />

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 flex-1 min-h-0">
        {/* ── LEFT PANEL — Query ─────────────────────────────────────────────── */}
        <aside
          className="flex flex-col gap-4 bg-(--surface-1) border border-(--border) rounded-xl p-4 shadow-sm h-fit"
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
                  onClick={() => setInteractionMode(value)}
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
                style={{ overflow: 'hidden' }}
              >
                <ContextSelector
                  selectedMode={structuredMode}
                  onModeChange={setStructuredMode}
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
            value={queryText}
            onChange={setQueryText}
            onSubmit={handleSubmit}
            isAnalyzing={isAnalyzing}
            canSubmit={canSubmit}
            placeholder={
              interactionMode === 'freeform'
                ? 'Ask any operational question…'
                : 'Optional: add context to this analysis…'
            }
            label={interactionMode === 'freeform' ? 'Operational Query' : 'Additional Context (Optional)'}
            inputId={interactionMode === 'freeform' ? 'freeform-query' : 'structured-context'}
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
          className="flex flex-col gap-4 bg-(--surface-1) border border-(--border) rounded-xl p-5 shadow-sm overflow-y-auto"
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
                <CommandCenterEmpty />
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
              >
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
