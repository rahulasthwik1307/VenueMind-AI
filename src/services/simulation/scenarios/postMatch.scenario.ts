import { SimulationScenario } from './scenario.interface';

export const postMatchScenario: SimulationScenario = {
  name: 'post-match',
  nextScenarioName: null,

  initialize: (telemetry) => {
    const now = new Date().toISOString();
    return {
      ...telemetry,
      matchTimeline: {
        value: { minute: 90, period: 'post-match', score: telemetry.matchTimeline.value.score },
        lastUpdated: now,
        source: 'match-director',
      },
    };
  },

  tickClock: (telemetry) => {
    // Post-match is the terminal scenario — the clock is frozen at the final
    // whistle value (90). Never increment beyond regulation time.
    return telemetry;
  },

  tickCrowd: (telemetry) => {
    const now = new Date().toISOString();
    // Egress begins, capacity and density fall rapidly
    const nextCapacity = Math.max(10, parseFloat((telemetry.stadiumCapacity.value - 1.2).toFixed(1)));
    const nextCrowd = Math.max(10, parseFloat((telemetry.crowdDensity.value - 1.5).toFixed(1)));
    return {
      ...telemetry,
      stadiumCapacity: { value: nextCapacity, lastUpdated: now, source: 'ticketing-api' },
      crowdDensity: { value: nextCrowd, lastUpdated: now, source: 'ingress-sensors' },
    };
  },

  tickTransport: (telemetry) => {
    const now = new Date().toISOString();
    // Transport hits Critical congestion during Egress peak
    return {
      ...telemetry,
      transportStatus: {
        value: 'Critical',
        lastUpdated: now,
        source: 'metro-transit',
      },
    };
  },

  tickWeather: (telemetry) => {
    const now = new Date().toISOString();
    // Rain clears up post-match
    return {
      ...telemetry,
      weather: {
        value: { temperature: 22.5, condition: 'Clear', windSpeed: 8 },
        lastUpdated: now,
        source: 'weather-station-1',
      },
    };
  },

  shouldTransition: () => {
    return false; // Terminal scenario
  },
};
