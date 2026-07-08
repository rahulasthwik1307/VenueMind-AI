import { create } from 'zustand';
import type { AssistantLanguage } from '@/types/assistant';

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  /** Global language preference — applied to all AI-generated output */
  language: AssistantLanguage;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: AssistantLanguage) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'system',
  language: 'en',
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
}));
