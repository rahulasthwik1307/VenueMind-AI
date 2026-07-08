import { create } from 'zustand';
import { Incident, IncidentAnalysis, Toast, ActivityItem } from '@/types/incident';
import { StadiumTelemetry } from '@/types/telemetry';
import { Severity } from '@/types/common';
import { MOCK_INCIDENTS } from '@/data/mockIncidents';
import { MOCK_ANALYSES } from '@/data/mockAnalyses';
import { operationsService } from '@/services/operations.service';
import { activityService } from '@/services/activity.service';

export interface IncidentState {
  incidents: Incident[];
  analyses: Record<string, IncidentAnalysis>;
  activeIncidentId: string | null;
  hoveredIncidentId: string | null;
  filter: 'all' | 'critical' | 'open' | 'investigating' | 'resolved';
  searchQuery: string;
  activities: ActivityItem[];
  toasts: Toast[];
  telemetry: StadiumTelemetry | null;
  stadiumStats: {
    crowdDensity: number;
    aiConfidence: number;
    transportStatus: string;
    medicalStandby: number;
  };
  setIncidents: (incidents: Incident[]) => void;
  setActiveIncidentId: (id: string | null) => void;
  setHoveredIncidentId: (id: string | null) => void;
  setFilter: (filter: 'all' | 'critical' | 'open' | 'investigating' | 'resolved') => void;
  setSearchQuery: (query: string) => void;
  dispatchAction: (incidentId: string, recommendationId: string) => void;
  markIncidentResolved: (incidentId: string) => void;
  updateIncidentNotes: (incidentId: string, notes: string) => void;
  dismissRecommendation: (incidentId: string, recommendationId: string) => void;
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  addActivity: (message: string, actor: string, severity?: Severity) => void;
  fluctuateStats: () => void;
  updateState: (newState: {
    telemetry?: StadiumTelemetry;
    incidents?: Incident[];
    analyses?: Record<string, IncidentAnalysis>;
    activities?: ActivityItem[];
  }) => void;
  resetAll: () => void;
}

const INITIAL_STADIUM_STATS = {
  crowdDensity: 30.0,
  aiConfidence: 94,
  transportStatus: 'Good',
  medicalStandby: 8,
};

export const useIncidentStore = create<IncidentState>((set) => ({
  incidents: MOCK_INCIDENTS,
  analyses: MOCK_ANALYSES,
  activeIncidentId: null,
  hoveredIncidentId: null,
  filter: 'all',
  searchQuery: '',
  activities: [],
  toasts: [],
  telemetry: null,
  stadiumStats: INITIAL_STADIUM_STATS,

  setIncidents: (incidents) => set({ incidents }),
  setActiveIncidentId: (id) => set({ activeIncidentId: id }),
  setHoveredIncidentId: (id) => set({ hoveredIncidentId: id }),
  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  // Delegate business logic mutations to Operations Engine
  dispatchAction: (incidentId, recommendationId) => {
    operationsService.dispatchRecommendation(incidentId, recommendationId);
  },

  markIncidentResolved: (incidentId) => {
    operationsService.resolveIncident(incidentId);
  },

  updateIncidentNotes: (incidentId, notes) => {
    operationsService.updateIncidentNotes(incidentId, notes);
  },

  dismissRecommendation: (incidentId, recommendationId) => {
    operationsService.dismissRecommendation(incidentId, recommendationId);
  },

  addToast: (message, type = 'info') => set((state) => {
    const newToast: Toast = {
      id: `toast-${Date.now()}-${Math.random()}`,
      message,
      type,
    };
    return { toasts: [...state.toasts, newToast] };
  }),

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  addActivity: (message, actor, severity) => set(() => {
    // Log to activityService to ensure it persists across simulation clock sags
    activityService.logActivity(message, actor, severity);
    return { activities: activityService.getActivities() };
  }),

  fluctuateStats: () => {
    // Handled in simulation service ticks.
  },

  // Centralized batch state synchronization
  updateState: (newState) => set((prev) => {
    const crowdDensity = newState.telemetry?.crowdDensity.value ?? prev.stadiumStats.crowdDensity;
    const transportStatus = newState.telemetry?.transportStatus.value ?? prev.stadiumStats.transportStatus;
    const medicalStandby = newState.telemetry?.medicalAvailability.value ?? prev.stadiumStats.medicalStandby;
    
    // Auto-calculate dynamic system AI confidence based on average active ticket confidence
    const activeTickets = (newState.incidents ?? prev.incidents).filter(i => i.status !== 'resolved');
    const aiConfidence = activeTickets.length > 0
      ? Math.round(activeTickets.reduce((sum, current) => sum + (current.aiConfidence ?? 85), 0) / activeTickets.length)
      : 98;

    return {
      ...newState,
      stadiumStats: {
        crowdDensity,
        transportStatus,
        medicalStandby,
        aiConfidence,
      },
    };
  }),

  resetAll: () => set({
    incidents: MOCK_INCIDENTS,
    analyses: MOCK_ANALYSES,
    activeIncidentId: null,
    filter: 'all',
    searchQuery: '',
    activities: [],
    toasts: [],
    telemetry: null,
    stadiumStats: INITIAL_STADIUM_STATS,
  }),
}));
