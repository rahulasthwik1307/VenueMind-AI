import { create } from 'zustand';

export interface Incident {
  id: string;
  title: string;
  status: 'open' | 'resolved' | 'investigating';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface IncidentState {
  incidents: Incident[];
  activeIncidentId: string | null;
  setIncidents: (incidents: Incident[]) => void;
  setActiveIncidentId: (id: string | null) => void;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  incidents: [],
  activeIncidentId: null,
  setIncidents: (incidents) => set({ incidents }),
  setActiveIncidentId: (id) => set({ activeIncidentId: id }),
}));
