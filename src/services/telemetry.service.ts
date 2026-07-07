import { StadiumTelemetry } from '@/types/telemetry';

type TelemetryListener = (telemetry: StadiumTelemetry) => void;

class TelemetryService {
  private currentTelemetry!: StadiumTelemetry;
  private listeners: TelemetryListener[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    const now = new Date().toISOString();
    this.currentTelemetry = {
      crowdDensity: { value: 30, lastUpdated: now, source: 'ingress-sensors' },
      weather: {
        value: { temperature: 28, condition: 'Clear', windSpeed: 10 },
        lastUpdated: now,
        source: 'weather-station-1',
      },
      medicalAvailability: { value: 8, lastUpdated: now, source: 'medical-dispatcher' },
      transportStatus: { value: 'Good', lastUpdated: now, source: 'metro-transit' },
      stadiumCapacity: { value: 25, lastUpdated: now, source: 'ticketing-api' },
      matchTimeline: {
        value: { minute: -60, period: 'pre-match', score: { home: 0, away: 0 } },
        lastUpdated: now,
        source: 'match-director',
      },
      systemHealth: {
        value: { cctv: 'Healthy', ticketing: 'Healthy', scada: 'Healthy' },
        lastUpdated: now,
        source: 'scada-monitor',
      },
    };
  }

  getTelemetry(): StadiumTelemetry {
    return this.currentTelemetry;
  }

  updateTelemetry(updater: (telemetry: StadiumTelemetry) => StadiumTelemetry) {
    this.currentTelemetry = updater(this.currentTelemetry);
    this.notify();
  }

  subscribe(listener: TelemetryListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentTelemetry));
  }
}

export const telemetryService = new TelemetryService();
