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

export interface OperationalEvent<T = any> {
  id: string;
  type: OperationalEventType;
  timestamp: string;
  payload: T;
}

export type OperationalEventHandler<T = any> = (event: OperationalEvent<T>) => void;
