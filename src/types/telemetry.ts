export interface TelemetryValue<T> {
  value: T;
  lastUpdated: string; // ISO string
  source: string;      // Sensor node ID or API name
}

export type WeatherCondition =
  | 'Clear'
  | 'Partly Cloudy'
  | 'Overcast'
  | 'Light Rain'
  | 'Heavy Rain'
  | 'Lightning Risk';

export type TransportStatus = 'Good' | 'Delayed' | 'Congested' | 'Critical';

export type MatchPeriod = 'pre-match' | 'first-half' | 'halftime' | 'second-half' | 'post-match';

export interface WeatherData {
  temperature: number; // °C
  condition: WeatherCondition;
  windSpeed: number; // km/h
}

export interface MatchTimelineData {
  minute: number;
  period: MatchPeriod;
  score: {
    home: number;
    away: number;
  };
}

export interface SystemHealthData {
  cctv: 'Healthy' | 'Degraded' | 'Critical';
  ticketing: 'Healthy' | 'Degraded' | 'Critical';
  scada: 'Healthy' | 'Degraded' | 'Critical';
}

export interface StadiumTelemetry {
  crowdDensity: TelemetryValue<number>; // Percentage 0-100
  weather: TelemetryValue<WeatherData>;
  medicalAvailability: TelemetryValue<number>; // Deployed/available count
  transportStatus: TelemetryValue<TransportStatus>;
  stadiumCapacity: TelemetryValue<number>; // Occupants percentage 0-100
  matchTimeline: TelemetryValue<MatchTimelineData>;
  systemHealth: TelemetryValue<SystemHealthData>;
}
