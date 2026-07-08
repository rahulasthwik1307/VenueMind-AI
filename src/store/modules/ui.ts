import { create } from 'zustand';
import type { AssistantLanguage } from '@/types/assistant';

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  /** Global language preference — applied to all AI-generated output */
  language: AssistantLanguage;
  /**
   * Global telemetry fault simulation flag.
   * When true, all LensPageLayout instances render their ErrorState overlay.
   * Controlled from the Settings page's System Diagnostics section.
   */
  telemetryFaultActive: boolean;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: AssistantLanguage) => void;
  setTelemetryFault: (active: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'system',
  language: 'en',
  telemetryFaultActive: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  setTelemetryFault: (telemetryFaultActive) => set({ telemetryFaultActive }),
}));
