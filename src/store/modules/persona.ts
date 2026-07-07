import { create } from 'zustand';

export interface PersonaState {
  currentPersona: string | null;
  setPersona: (persona: string | null) => void;
}

export const usePersonaStore = create<PersonaState>((set) => ({
  currentPersona: null,
  setPersona: (persona) => set({ currentPersona: persona }),
}));
