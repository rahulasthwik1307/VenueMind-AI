import { useIncidentStore } from '../store/modules/incident';

export function useIncident() {
  const incidents = useIncidentStore((state) => state.incidents);
  const activeIncidentId = useIncidentStore((state) => state.activeIncidentId);
  const setIncidents = useIncidentStore((state) => state.setIncidents);
  const setActiveIncidentId = useIncidentStore((state) => state.setActiveIncidentId);

  return {
    incidents,
    activeIncidentId,
    setIncidents,
    setActiveIncidentId,
  };
}
