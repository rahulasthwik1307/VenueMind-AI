export interface IncidentService {
  getIncidents: () => Promise<unknown[]>;
  createIncident: (incidentData: Record<string, unknown>) => Promise<unknown>;
}

export const incidentService: IncidentService = {
  getIncidents: async () => {
    return Promise.resolve([]);
  },
  createIncident: async (incidentData) => {
    return Promise.resolve({
      id: Math.random().toString(),
      ...incidentData,
    });
  },
};
