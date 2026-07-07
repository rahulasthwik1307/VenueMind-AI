import type { Incident } from './incident';
import type { IncidentStatus } from './common';

export type OperationalEventType =
  | 'IncidentCreated'
  | 'IncidentResolved'
  | 'IncidentStatusChanged'
  | 'GoalScored'
  | 'WeatherChanged'
  | 'TransportDelay'
  | 'GateClosed'
  | 'RecommendationExecuted'
  | 'RecommendationDismissed'
  | 'TelemetryUpdated';

export interface BaseOperationalEvent {
  id: string;
  timestamp: string;
}

export interface IncidentCreatedEvent extends BaseOperationalEvent {
  type: 'IncidentCreated';
  payload: Incident;
}

export interface IncidentResolvedEvent extends BaseOperationalEvent {
  type: 'IncidentResolved';
  payload: Incident;
}

export interface IncidentStatusChangedEvent extends BaseOperationalEvent {
  type: 'IncidentStatusChanged';
  payload: {
    title: string;
    status: IncidentStatus;
  };
}

export interface GoalScoredEvent extends BaseOperationalEvent {
  type: 'GoalScored';
  payload: {
    scorer: string;
    score: {
      home: number;
      away: number;
    };
  };
}

export interface WeatherChangedEvent extends BaseOperationalEvent {
  type: 'WeatherChanged';
  payload: {
    condition: string;
    temperature: number;
  };
}

export interface TransportDelayEvent extends BaseOperationalEvent {
  type: 'TransportDelay';
  payload: {
    route: string;
    delayMinutes: number;
  };
}

export interface GateClosedEvent extends BaseOperationalEvent {
  type: 'GateClosed';
  payload: {
    gate: string;
  };
}

export interface RecommendationExecutedEvent extends BaseOperationalEvent {
  type: 'RecommendationExecuted';
  payload: {
    incidentId: string;
    recId: string;
    recTitle: string;
    actionText: string;
  };
}

export interface RecommendationDismissedEvent extends BaseOperationalEvent {
  type: 'RecommendationDismissed';
  payload: {
    incidentId: string;
    recId: string;
    recTitle: string;
  };
}

export interface TelemetryUpdatedEvent extends BaseOperationalEvent {
  type: 'TelemetryUpdated';
  payload: unknown;
}

export type OperationalEvent =
  | IncidentCreatedEvent
  | IncidentResolvedEvent
  | IncidentStatusChangedEvent
  | GoalScoredEvent
  | WeatherChangedEvent
  | TransportDelayEvent
  | GateClosedEvent
  | RecommendationExecutedEvent
  | RecommendationDismissedEvent
  | TelemetryUpdatedEvent;

export type OperationalEventHandler = (event: OperationalEvent) => void;
