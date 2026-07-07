import { Severity, IncidentStatus } from './common';

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: Severity;
  location: {
    lat: number;
    lng: number;
    zone: string;
  };
  reporterId: string;
  createdAt: string;
  updatedAt: string;
}
