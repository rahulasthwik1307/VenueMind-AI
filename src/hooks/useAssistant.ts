import { useAssistantStore } from '../store/modules/assistant';

/**
 * Convenience hook wrapping useAssistantStore.
 * Exposes the new AssistantState shape introduced in Stage 6.
 * Old field names (messages, isResponding, addMessage, setResponding, clearMessages)
 * are mapped to their new equivalents for any consumers still using this hook.
 */
export function useAssistant() {
  const conversationHistory = useAssistantStore((state) => state.conversationHistory);
  const isAnalyzing = useAssistantStore((state) => state.isAnalyzing);
  const lastResponse = useAssistantStore((state) => state.lastResponse);
  const error = useAssistantStore((state) => state.error);
  const submitQuery = useAssistantStore((state) => state.submitQuery);
  const clearHistory = useAssistantStore((state) => state.clearHistory);
  const clearError = useAssistantStore((state) => state.clearError);

  return {
    // New API (canonical)
    conversationHistory,
    isAnalyzing,
    lastResponse,
    error,
    submitQuery,
    clearHistory,
    clearError,
    // Legacy aliases for backward compatibility with any existing consumers
    messages: conversationHistory,
    isResponding: isAnalyzing,
    clearMessages: clearHistory,
  };
}
