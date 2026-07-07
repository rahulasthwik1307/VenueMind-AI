export interface IncidentService {
  getIncidents: () => Promise<any[]>;
  createIncident: (incidentData: any) => Promise<any>;
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
