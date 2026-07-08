'use client';

/**
 * IncidentBulkActions — Bulk action toolbar for the Incidents Console
 *
 * Appears when >= 1 incident is selected in IncidentTable.
 * Actions:
 *  - Bulk resolve: calls bulkUpdateIncidents with status: 'resolved'
 *  - Bulk assign team: calls bulkUpdateIncidents with assignedTeam: inputValue
 *  - Ask AI for Consolidated Briefing: calls submitQuery with mode: 'incidents'
 *    via the structured contextBuilder path — no manual prompt construction here.
 *
 * AI button is disabled + aria-disabled while isAnalyzing (matches Command Center pattern).
 * AI response container uses aria-live="polite" (matches Command Center pattern).
 */

import { useState, useCallback } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { CheckCircle, Users, Brain, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useIncidentStore } from '@/store/modules/incident';
import { useAssistantStore } from '@/store/modules/assistant';
import { AnalyzingState } from '@/components/ai/AnalyzingState';
import { CommandCenterError } from '@/components/ai/CommandCenterError';
import { AIResponseCard } from '@/components/ai/AIResponseCard';

interface IncidentBulkActionsProps {
  selectedIds: string[];
  onClearSelection: () => void;
}

export function IncidentBulkActions({ selectedIds, onClearSelection }: IncidentBulkActionsProps) {
  const { bulkUpdateIncidents, addToast } = useIncidentStore();
  const { lastResponse, isAnalyzing, error, submitQuery, clearHistory, clearError } =
    useAssistantStore();

  const [assignInput, setAssignInput] = useState('');
  const [showAssignInput, setShowAssignInput] = useState(false);
  const [briefingRequested, setBriefingRequested] = useState(false);

  const handleBulkResolve = useCallback(() => {
    if (selectedIds.length === 0) return;
    bulkUpdateIncidents(selectedIds, { status: 'resolved' });
    addToast(`${selectedIds.length} incident(s) marked as resolved`, 'success');
    onClearSelection();
  }, [selectedIds, bulkUpdateIncidents, addToast, onClearSelection]);

  const handleBulkAssign = useCallback(() => {
    const team = assignInput.trim();
    if (!team || selectedIds.length === 0) return;
    bulkUpdateIncidents(selectedIds, { assignedTeam: team });
    addToast(`${selectedIds.length} incident(s) assigned to ${team}`, 'success');
    setAssignInput('');
    setShowAssignInput(false);
  }, [assignInput, selectedIds, bulkUpdateIncidents, addToast]);

  const handleRequestBriefing = useCallback(() => {
    if (isAnalyzing || selectedIds.length === 0) return;
    clearError();
    setBriefingRequested(true);
    // Routes through the new 'incidents' mode in contextBuilder — no manual prompt here
    submitQuery({
      mode: 'incidents',
      rawQuery: '',
      persona: 'operations',
      incidentIds: selectedIds,
    });
  }, [isAnalyzing, selectedIds, clearError, submitQuery]);

  const handleClearBriefing = useCallback(() => {
    clearHistory();
    setBriefingRequested(false);
  }, [clearHistory]);

  if (selectedIds.length === 0) return null;

  // Determine response area state
  type ResponseState = 'idle' | 'analyzing' | 'error' | 'response';
  let responseState: ResponseState = 'idle';
  if (briefingRequested) {
    if (isAnalyzing) responseState = 'analyzing';
    else if (error) responseState = 'error';
    else if (lastResponse) responseState = 'response';
  }

  return (
    <m.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="bg-(--surface-1) border border-(--primary-light) rounded-xl overflow-hidden shadow-sm"
      role="region"
      aria-label={`Bulk actions for ${selectedIds.length} selected incidents`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-(--primary-muted)/30 border-b border-(--primary-light)">
        <span className="text-[10px] font-bold font-mono text-(--primary) uppercase tracking-wide">
          {selectedIds.length} selected
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Bulk Resolve */}
          <button
            onClick={handleBulkResolve}
            className={cn(
              'flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-md border transition-all cursor-pointer',
              'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50',
              'hover:bg-green-100 dark:hover:bg-green-950/40'
            )}
            aria-label={`Resolve ${selectedIds.length} selected incidents`}
          >
            <CheckCircle size={11} />
            Resolve All
          </button>

          {/* Bulk Assign */}
          {showAssignInput ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleBulkAssign();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={assignInput}
                onChange={(e) => setAssignInput(e.target.value)}
                placeholder="Team name…"
                autoFocus
                className={cn(
                  'text-[10px] px-2.5 py-1.5 rounded-md border bg-(--surface-2) border-(--border)',
                  'text-(--foreground) placeholder:text-(--foreground-subtle)',
                  'focus:outline-none focus:ring-1 focus:ring-(--primary) w-36'
                )}
                aria-label="Team name to assign selected incidents to"
              />
              <button
                type="submit"
                disabled={!assignInput.trim()}
                className="text-[10px] font-semibold px-2.5 py-1.5 rounded-md bg-(--primary) text-white disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed transition-all"
                aria-label="Confirm team assignment"
              >
                Assign
              </button>
              <button
                type="button"
                onClick={() => setShowAssignInput(false)}
                className="p-1 text-(--foreground-subtle) hover:text-(--foreground) cursor-pointer"
                aria-label="Cancel team assignment"
              >
                <X size={12} />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowAssignInput(true)}
              className={cn(
                'flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-md border transition-all cursor-pointer',
                'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50',
                'hover:bg-blue-100 dark:hover:bg-blue-950/40'
              )}
              aria-label="Assign selected incidents to a team"
            >
              <Users size={11} />
              Assign Team
            </button>
          )}

          {/* AI Consolidated Briefing */}
          <button
            onClick={handleRequestBriefing}
            disabled={isAnalyzing}
            aria-disabled={isAnalyzing}
            className={cn(
              'flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-md border transition-all',
              'text-(--primary) bg-(--primary-muted) border-(--primary-light)',
              isAnalyzing
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-(--primary) hover:text-white cursor-pointer'
            )}
            aria-label={
              isAnalyzing
                ? 'AI briefing in progress'
                : `Ask AI for consolidated briefing on ${selectedIds.length} selected incidents`
            }
          >
            <Brain size={11} className={isAnalyzing ? 'animate-pulse' : ''} />
            {isAnalyzing ? 'Analyzing…' : 'Ask AI: Consolidated Briefing'}
          </button>
        </div>

        {/* Clear selection */}
        <button
          onClick={onClearSelection}
          className="ml-auto flex items-center gap-1 text-[9px] font-mono text-(--foreground-subtle) hover:text-(--foreground) transition-colors cursor-pointer"
          aria-label="Clear incident selection"
        >
          <X size={10} />
          Clear
        </button>
      </div>

      {/* AI Response Area — aria-live="polite" for screen reader announcements */}
      <AnimatePresence mode="wait">
        {responseState !== 'idle' && (
          <m.div
            key={responseState}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            aria-live="polite"
            aria-atomic="false"
            className="px-4 py-4"
          >
            {responseState === 'analyzing' && <AnalyzingState />}
            {responseState === 'error' && error && (
              <CommandCenterError error={error} onRetry={handleRequestBriefing} />
            )}
            {responseState === 'response' && lastResponse && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono font-bold text-(--foreground-subtle) uppercase">
                    Consolidated Briefing · {selectedIds.length} incidents
                  </span>
                  <button
                    onClick={handleClearBriefing}
                    className="text-[9px] font-mono text-(--foreground-muted) hover:text-(--foreground) border border-(--border) px-1.5 py-0.5 rounded bg-(--surface-2) cursor-pointer"
                    aria-label="Clear AI briefing"
                  >
                    Clear
                  </button>
                </div>
                <AIResponseCard response={lastResponse} />
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}
