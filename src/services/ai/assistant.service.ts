export interface AssistantService {
  sendMessage: (messageContent: string, persona: string) => Promise<unknown>;
}

export const assistantService: AssistantService = {
  sendMessage: async (messageContent, persona) => {
    // Placeholder implementation
    return Promise.resolve({
      id: Math.random().toString(),
      role: 'assistant',
      content: `Response for persona ${persona}: ${messageContent}`,
    });
  },
};
