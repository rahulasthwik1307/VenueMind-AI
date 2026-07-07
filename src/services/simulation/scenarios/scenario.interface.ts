import { StadiumTelemetry } from '@/types/telemetry';

export interface SimulationScenario {
  name: string;
  nextScenarioName: string | null;
  
  initialize: (telemetry: StadiumTelemetry) => StadiumTelemetry;
  tickClock: (telemetry: StadiumTelemetry) => StadiumTelemetry;
  tickCrowd: (telemetry: StadiumTelemetry) => StadiumTelemetry;
  tickTransport: (telemetry: StadiumTelemetry) => StadiumTelemetry;
  tickWeather: (telemetry: StadiumTelemetry) => StadiumTelemetry;
  shouldTransition: (telemetry: StadiumTelemetry) => boolean;
}
