import { useAssistantStore } from '../store/modules/assistant';

export function useAssistant() {
  const messages = useAssistantStore((state) => state.messages);
  const isResponding = useAssistantStore((state) => state.isResponding);
  const addMessage = useAssistantStore((state) => state.addMessage);
  const setResponding = useAssistantStore((state) => state.setResponding);
  const clearMessages = useAssistantStore((state) => state.clearMessages);

  return {
    messages,
    isResponding,
    addMessage,
    setResponding,
    clearMessages,
  };
}
