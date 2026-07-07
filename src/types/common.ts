export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
