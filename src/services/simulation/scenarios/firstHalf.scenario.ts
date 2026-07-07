import { SimulationScenario } from './scenario.interface';

export const firstHalfScenario: SimulationScenario = {
  name: 'first-half',
  nextScenarioName: 'halftime',

  initialize: (telemetry) => {
    const now = new Date().toISOString();
    return {
      ...telemetry,
      matchTimeline: {
        value: { minute: 0, period: 'first-half', score: { home: 0, away: 0 } },
        lastUpdated: now,
        source: 'match-director',
      },
    };
  },

  tickClock: (telemetry) => {
    const now = new Date().toISOString();
    const currentMin = telemetry.matchTimeline.value.minute;
    const nextMin = currentMin + 1;
    
    // Simulate Brazil scoring at minute 24!
    const score = { ...telemetry.matchTimeline.value.score };
    if (nextMin === 24) {
      score.home = 1;
    }

    return {
      ...telemetry,
      matchTimeline: {
        value: { ...telemetry.matchTimeline.value, minute: nextMin, score },
        lastUpdated: now,
        source: 'match-director',
      },
    };
  },

  tickCrowd: (telemetry) => {
    const now = new Date().toISOString();
    // Crowd rises slowly to max seats
    const nextCapacity = Math.min(82, parseFloat((telemetry.stadiumCapacity.value + 0.2).toFixed(1)));
    const nextCrowd = Math.min(84, parseFloat((telemetry.crowdDensity.value + 0.2).toFixed(1)));
    return {
      ...telemetry,
      stadiumCapacity: { value: nextCapacity, lastUpdated: now, source: 'ticketing-api' },
      crowdDensity: { value: nextCrowd, lastUpdated: now, source: 'ingress-sensors' },
    };
  },

  tickTransport: (telemetry) => {
    const now = new Date().toISOString();
    // Keep it Delayed during the match ingress tail
    return {
      ...telemetry,
      transportStatus: {
        value: 'Delayed',
        lastUpdated: now,
        source: 'metro-transit',
      },
    };
  },

  tickWeather: (telemetry) => {
    const now = new Date().toISOString();
    // Gradually cooling down, weather turns Partly Cloudy
    const delta = (Math.random() - 0.5) * 0.1;
    const nextTemp = parseFloat((telemetry.weather.value.temperature + delta - 0.05).toFixed(1));
    return {
      ...telemetry,
      weather: {
        value: { temperature: nextTemp, condition: 'Partly Cloudy', windSpeed: 12 },
        lastUpdated: now,
        source: 'weather-station-1',
      },
    };
  },

  shouldTransition: (telemetry) => {
    return telemetry.matchTimeline.value.minute >= 45;
  },
};
