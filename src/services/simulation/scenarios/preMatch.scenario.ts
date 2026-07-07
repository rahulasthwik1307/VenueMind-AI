import { SimulationScenario } from './scenario.interface';

export const preMatchScenario: SimulationScenario = {
  name: 'pre-match',
  nextScenarioName: 'first-half',

  initialize: (telemetry) => {
    const now = new Date().toISOString();
    return {
      ...telemetry,
      matchTimeline: {
        value: { minute: -60, period: 'pre-match', score: { home: 0, away: 0 } },
        lastUpdated: now,
        source: 'match-director',
      },
      crowdDensity: { value: 35.0, lastUpdated: now, source: 'ingress-sensors' },
      stadiumCapacity: { value: 30.0, lastUpdated: now, source: 'ticketing-api' },
      transportStatus: { value: 'Good', lastUpdated: now, source: 'metro-transit' },
      weather: {
        value: { temperature: 27.5, condition: 'Clear', windSpeed: 10 },
        lastUpdated: now,
        source: 'weather-station-1',
      },
      medicalAvailability: { value: 8, lastUpdated: now, source: 'medical-dispatcher' },
      systemHealth: {
        value: { cctv: 'Healthy', ticketing: 'Healthy', scada: 'Healthy' },
        lastUpdated: now,
        source: 'scada-monitor',
      },
    };
  },

  tickClock: (telemetry) => {
    const now = new Date().toISOString();
    const currentMin = telemetry.matchTimeline.value.minute;
    const nextMin = currentMin + 1; // tick clock by 1 minute virtual time
    
    // Simulate ticketing network dropout around minute -20
    let sysHealth = { ...telemetry.systemHealth.value };
    if (nextMin === -20) {
      sysHealth.ticketing = 'Degraded';
    }

    return {
      ...telemetry,
      matchTimeline: {
        value: { ...telemetry.matchTimeline.value, minute: nextMin },
        lastUpdated: now,
        source: 'match-director',
      },
      systemHealth: {
        value: sysHealth,
        lastUpdated: now,
        source: 'scada-monitor',
      },
    };
  },

  tickCrowd: (telemetry) => {
    const now = new Date().toISOString();
    // Ingress increases capacity and crowd density
    const nextCapacity = Math.min(75, parseFloat((telemetry.stadiumCapacity.value + 0.8).toFixed(1)));
    const nextCrowd = Math.min(75, parseFloat((telemetry.crowdDensity.value + 0.9).toFixed(1)));
    return {
      ...telemetry,
      stadiumCapacity: { value: nextCapacity, lastUpdated: now, source: 'ticketing-api' },
      crowdDensity: { value: nextCrowd, lastUpdated: now, source: 'ingress-sensors' },
    };
  },

  tickTransport: (telemetry) => {
    const now = new Date().toISOString();
    // Transport starts showing slight delays around minute -15 due to traffic
    const isLate = telemetry.matchTimeline.value.minute >= -15;
    return {
      ...telemetry,
      transportStatus: {
        value: isLate ? 'Delayed' : 'Good',
        lastUpdated: now,
        source: 'metro-transit',
      },
    };
  },

  tickWeather: (telemetry) => {
    const now = new Date().toISOString();
    // Weather stays steady, minor temperature variations
    const delta = (Math.random() - 0.5) * 0.2;
    const nextTemp = parseFloat((telemetry.weather.value.temperature + delta).toFixed(1));
    return {
      ...telemetry,
      weather: {
        value: { ...telemetry.weather.value, temperature: nextTemp },
        lastUpdated: now,
        source: 'weather-station-1',
      },
    };
  },

  shouldTransition: (telemetry) => {
    return telemetry.matchTimeline.value.minute >= 0;
  },
};
