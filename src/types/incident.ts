import { Severity, IncidentStatus } from './common';

export type TimelineEventType =
  | 'detection'
  | 'ai_analysis'
  | 'operator_action'
  | 'security'
  | 'medical'
  | 'volunteer'
  | 'transport'
  | 'system'
  | 'resolution';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: TimelineEventType;
}

export interface Recommendation {
  id: string;
  title: string;
  explanation: string;
  action: string;
  confidence: number;
  expectedImpact: string;
  eta: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  executed: boolean;
  dismissed?: boolean;
}

export interface Facility {
  name: string;
  distance: string;
  type: 'medical' | 'gate' | 'staff' | 'security' | 'general' | 'transport';
}

export interface AISituationSummary {
  explanation: string;
  expectedRisks: string;
  recommendedResponse: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  severity: Severity;
  category: 'crowd' | 'medical' | 'security' | 'infrastructure' | 'transport' | 'weather' | 'volunteer' | 'accessibility';
  location: {
    lat: number;
    lng: number;
    zone: string;
  };
  reporterId: string;
  createdAt: string;
  updatedAt: string;
  assignedTeam?: string;
  aiConfidence?: number;
  timeline: TimelineEvent[];
  notes?: string;
}

export interface IncidentAnalysis {
  incidentId: string;
  aiSituationSummary: AISituationSummary;
  recommendations: Recommendation[];
  nearbyFacilities: Facility[];
  estimatedImpact: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface ActivityItem {
  id: string;
  message: string;
  actor: string;
  time: string; // E.g. raw timestamp, formatted by component
  severity?: Severity;
  incidentId?: string;
  matchPhase?: string;
}
