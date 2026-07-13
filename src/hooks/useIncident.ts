import { useShallow } from 'zustand/shallow';
import { useIncidentStore, IncidentState } from '../store/modules/incident';

const defaultSelector = (state: IncidentState) => ({
  incidents: state.incidents,
  analyses: state.analyses,
  activeIncidentId: state.activeIncidentId,
  filter: state.filter,
  searchQuery: state.searchQuery,
  activities: state.activities,
  readNotifIds: state.readNotifIds,
  toasts: state.toasts,
  stadiumStats: state.stadiumStats,
  telemetry: state.telemetry,
  setIncidents: state.setIncidents,
  setActiveIncidentId: state.setActiveIncidentId,
  setFilter: state.setFilter,
  setSearchQuery: state.setSearchQuery,
  dispatchAction: state.dispatchAction,
  markIncidentResolved: state.markIncidentResolved,
  updateIncidentNotes: state.updateIncidentNotes,
  dismissRecommendation: state.dismissRecommendation,
  addToast: state.addToast,
  removeToast: state.removeToast,
  addActivity: state.addActivity,
  markNotifRead: state.markNotifRead,
  markAllNotifsRead: state.markAllNotifsRead,
  fluctuateStats: state.fluctuateStats,
});

export function useIncident<T = ReturnType<typeof defaultSelector>>(
  selector?: (state: IncidentState) => T
): T {
  const defaultShallow = useShallow(defaultSelector);
  const activeSelector = selector ?? (defaultShallow as unknown as (state: IncidentState) => T);
  return useIncidentStore(activeSelector);
}
