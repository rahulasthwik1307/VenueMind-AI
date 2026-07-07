import { StadiumTelemetry } from './telemetry';
import { Incident, IncidentAnalysis, ActivityItem, Toast } from './incident';

export interface OperationalState {
  telemetry: StadiumTelemetry;
  incidents: Incident[];
  analyses: Record<string, IncidentAnalysis>;
  activities: ActivityItem[];
  toasts: Toast[];
  activeIncidentId: string | null;
  filter: 'all' | 'critical' | 'open' | 'investigating' | 'resolved';
  searchQuery: string;
}
