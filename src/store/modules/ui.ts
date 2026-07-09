import { create } from 'zustand';
import type { AssistantLanguage } from '@/types/assistant';

export interface ShiftNote {
  id: string;
  timestamp: string;
  content: string;
}

export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  /** Global language preference — applied to all AI-generated output */
  language: AssistantLanguage;
  /** Global telemetry fault simulation flag.
   * When true, all LensPageLayout instances render their ErrorState overlay.
   * Controlled from the Settings page's System Diagnostics section.
   */
  telemetryFaultActive: boolean;
  operationsNotes: string;
  shiftNotes: ShiftNote[];
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: AssistantLanguage) => void;
  setTelemetryFault: (active: boolean) => void;
  setOperationsNotes: (notes: string) => void;
  addShiftNote: (content: string) => void;
  deleteShiftNote: (id: string) => void;
  clearShiftNotes: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'system',
  language: 'en',
  telemetryFaultActive: false,
  operationsNotes: '',
  shiftNotes: [],
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setTheme: (theme) => set({ theme }),
  setLanguage: (language) => set({ language }),
  setTelemetryFault: (telemetryFaultActive) => set({ telemetryFaultActive }),
  setOperationsNotes: (operationsNotes) => set({ operationsNotes }),
  addShiftNote: (content) =>
    set((state) => {
      const newNote: ShiftNote = {
        id: `note-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        content: content.trim(),
      };
      const newNotes = [newNote, ...state.shiftNotes].slice(0, 5);
      return {
        shiftNotes: newNotes,
        operationsNotes: '', // Reset draft
      };
    }),
  deleteShiftNote: (id) =>
    set((state) => ({
      shiftNotes: state.shiftNotes.filter((n) => n.id !== id),
    })),
  clearShiftNotes: () => set({ shiftNotes: [] }),
}));
