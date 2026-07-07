import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AssistantState {
  messages: Message[];
  isResponding: boolean;
  addMessage: (message: Message) => void;
  setResponding: (isResponding: boolean) => void;
  clearMessages: () => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  messages: [],
  isResponding: false,
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  setResponding: (isResponding) => set({ isResponding }),
  clearMessages: () => set({ messages: [] }),
}));
