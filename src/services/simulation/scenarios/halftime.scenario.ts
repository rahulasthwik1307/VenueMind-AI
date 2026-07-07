import { SimulationScenario } from './scenario.interface';

let halftimeTicks = 0;

export const halftimeScenario: SimulationScenario = {
  name: 'halftime',
  nextScenarioName: 'second-half',

  initialize: (telemetry) => {
    const now = new Date().toISOString();
    halftimeTicks = 0;
    return {
      ...telemetry,
      matchTimeline: {
        value: { minute: 45, period: 'halftime', score: telemetry.matchTimeline.value.score },
        lastUpdated: now,
        source: 'match-director',
      },
    };
  },

  tickClock: (telemetry) => {
    const now = new Date().toISOString();
    halftimeTicks += 1;
    
    // Simulate SCADA mechanical issue with elevator VIP at halftime tick 3
    let sysHealth = { ...telemetry.systemHealth.value };
    if (halftimeTicks === 3) {
      sysHealth.scada = 'Degraded';
    }

    return {
      ...telemetry,
      systemHealth: {
        value: sysHealth,
        lastUpdated: now,
        source: 'scada-monitor',
      },
      matchTimeline: {
        value: { ...telemetry.matchTimeline.value, minute: 45 },
        lastUpdated: now,
        source: 'match-director',
      },
    };
  },

  tickCrowd: (telemetry) => {
    const now = new Date().toISOString();
    // Shift in density as spectators move to food plazas
    const crowdDelta = (Math.random() - 0.5) * 1.5;
    const nextCrowd = Math.min(85, Math.max(70, parseFloat((telemetry.crowdDensity.value + crowdDelta).toFixed(1))));
    return {
      ...telemetry,
      crowdDensity: { value: nextCrowd, lastUpdated: now, source: 'concourse-sensors' },
    };
  },

  tickTransport: (telemetry) => {
    const now = new Date().toISOString();
    // Transport normalizes during the game
    return {
      ...telemetry,
      transportStatus: {
        value: 'Good',
        lastUpdated: now,
        source: 'metro-transit',
      },
    };
  },

  tickWeather: (telemetry) => {
    const now = new Date().toISOString();
    // Temperature drops slightly, cloudiness increases
    return {
      ...telemetry,
      weather: {
        value: { temperature: 25.5, condition: 'Overcast', windSpeed: 14 },
        lastUpdated: now,
        source: 'weather-station-1',
      },
    };
  },

  shouldTransition: () => {
    return halftimeTicks >= 15; // stays in halftime for 15 ticks (15 seconds)
  },
};
