import { useIncidentStore } from '../store/modules/incident';

export function useIncident() {
  const incidents = useIncidentStore((state) => state.incidents);
  const analyses = useIncidentStore((state) => state.analyses);
  const activeIncidentId = useIncidentStore((state) => state.activeIncidentId);
  const filter = useIncidentStore((state) => state.filter);
  const searchQuery = useIncidentStore((state) => state.searchQuery);
  const activities = useIncidentStore((state) => state.activities);
  const toasts = useIncidentStore((state) => state.toasts);
  const stadiumStats = useIncidentStore((state) => state.stadiumStats);
  const telemetry = useIncidentStore((state) => state.telemetry);
  
  const setIncidents = useIncidentStore((state) => state.setIncidents);
  const setActiveIncidentId = useIncidentStore((state) => state.setActiveIncidentId);
  const setFilter = useIncidentStore((state) => state.setFilter);
  const setSearchQuery = useIncidentStore((state) => state.setSearchQuery);
  const dispatchAction = useIncidentStore((state) => state.dispatchAction);
  const markIncidentResolved = useIncidentStore((state) => state.markIncidentResolved);
  const updateIncidentNotes = useIncidentStore((state) => state.updateIncidentNotes);
  const dismissRecommendation = useIncidentStore((state) => state.dismissRecommendation);
  const addToast = useIncidentStore((state) => state.addToast);
  const removeToast = useIncidentStore((state) => state.removeToast);
  const addActivity = useIncidentStore((state) => state.addActivity);
  const fluctuateStats = useIncidentStore((state) => state.fluctuateStats);

  return {
    incidents,
    analyses,
    activeIncidentId,
    filter,
    searchQuery,
    activities,
    toasts,
    stadiumStats,
    telemetry,
    setIncidents,
    setActiveIncidentId,
    setFilter,
    setSearchQuery,
    dispatchAction,
    markIncidentResolved,
    updateIncidentNotes,
    dismissRecommendation,
    addToast,
    removeToast,
    addActivity,
    fluctuateStats,
  };
}
