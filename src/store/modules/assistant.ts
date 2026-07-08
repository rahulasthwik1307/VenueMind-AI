import { create } from 'zustand';
import type {
  Message,
  AIStructuredResponse,
  AssistantError,
  SubmitQueryInput,
} from '@/types/assistant';
import { buildAssistantQuery } from '@/services/ai/contextBuilder.service';
import { assistantService } from '@/services/ai/assistant.service';
import { useUIStore } from '@/store/modules/ui';
import { logger } from '@/lib/logger';

/** Max messages retained in session history (per-direction) */
const MAX_HISTORY_MESSAGES = 20;

export interface AssistantState {
  /** Flat chronological message history for the current session */
  conversationHistory: Message[];
  /** The most recent structured AI response, rendered by AIResponseCard */
  lastResponse: AIStructuredResponse | null;
  /** True while a Groq request is in flight */
  isAnalyzing: boolean;
  /** Typed error from the most recent failed request, null otherwise */
  error: AssistantError | null;

  // ─── Actions ────────────────────────────────────────────────────────────────
  /**
   * Submit a query to the AI pipeline.
   * Reads language from useUIStore and history from self.
   * Delegates context assembly to contextBuilder.service.ts (pure function).
   */
  submitQuery: (input: SubmitQueryInput) => Promise<void>;
  /** Clear all session history and last response */
  clearHistory: () => void;
  /** Clear only the error state (e.g. before a retry) */
  clearError: () => void;
}

export const useAssistantStore = create<AssistantState>((set, get) => ({
  conversationHistory: [],
  lastResponse: null,
  isAnalyzing: false,
  error: null,

  submitQuery: async (input: SubmitQueryInput) => {
    // Prevent concurrent submissions
    if (get().isAnalyzing) return;

    const language = useUIStore.getState().language;
    const { conversationHistory } = get();

    // Build the full query via pure context builder function
    const assembledQuery = buildAssistantQuery({
      mode: input.mode,
      rawQuery: input.rawQuery,
      language,
      persona: input.persona ?? 'operations',
      conversationHistory: conversationHistory.slice(-MAX_HISTORY_MESSAGES),
      incident: input.incident,
      zoneId: input.zoneId,
      domain: input.domain,
      incidentIds: input.incidentIds,
    });

    // Record the user message in history
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: assembledQuery.query,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      isAnalyzing: true,
      error: null,
      conversationHistory: [...state.conversationHistory, userMsg],
    }));

    try {
      const result = await assistantService.query(assembledQuery);

      if (result.success) {
        // Store a human-readable assistant message in history
        const aiMsg: Message = {
          id: `msg-${Date.now()}-ai`,
          role: 'assistant',
          content: result.data.situationOverview,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          isAnalyzing: false,
          lastResponse: result.data,
          error: null,
          conversationHistory: [...state.conversationHistory, aiMsg],
        }));
      } else {
        set({ isAnalyzing: false, error: result.error });
      }
    } catch (err) {
      logger.error('[assistantStore] submitQuery threw unexpectedly', err);
      set({
        isAnalyzing: false,
        error: { type: 'unknown', message: 'An unexpected error occurred. Please try again.' },
      });
    }
  },

  clearHistory: () =>
    set({ conversationHistory: [], lastResponse: null, error: null }),

  clearError: () => set({ error: null }),
}));
