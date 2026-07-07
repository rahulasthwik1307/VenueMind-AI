import { SimulationScenario } from './scenario.interface';

export const secondHalfScenario: SimulationScenario = {
  name: 'second-half',
  nextScenarioName: 'post-match',

  initialize: (telemetry) => {
    const now = new Date().toISOString();
    return {
      ...telemetry,
      matchTimeline: {
        value: { minute: 45, period: 'second-half', score: telemetry.matchTimeline.value.score },
        lastUpdated: now,
        source: 'match-director',
      },
    };
  },

  tickClock: (telemetry) => {
    const now = new Date().toISOString();
    const currentMin = telemetry.matchTimeline.value.minute;
    const nextMin = currentMin + 1;

    // Simulate Argentina scoring at minute 67 to equalize (1-1)!
    let score = { ...telemetry.matchTimeline.value.score };
    if (nextMin === 67) {
      score.away = 1;
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
    // Spectators return to seats
    const nextCrowd = Math.min(86, Math.max(80, parseFloat((telemetry.crowdDensity.value + 0.1).toFixed(1))));
    return {
      ...telemetry,
      crowdDensity: { value: nextCrowd, lastUpdated: now, source: 'ingress-sensors' },
    };
  },

  tickTransport: (telemetry) => {
    const now = new Date().toISOString();
    // Transport starts showing sags as kickoff end approaches (around minute 75)
    const isLateGame = telemetry.matchTimeline.value.minute >= 75;
    return {
      ...telemetry,
      transportStatus: {
        value: isLateGame ? 'Congested' : 'Delayed',
        lastUpdated: now,
        source: 'metro-transit',
      },
    };
  },

  tickWeather: (telemetry) => {
    const now = new Date().toISOString();
    const min = telemetry.matchTimeline.value.minute;
    
    // Simulate storm approaching:
    // min < 65: Overcast
    // min >= 65 and min < 78: Light Rain
    // min >= 78: Heavy Rain + Lightning Risk
    let cond = telemetry.weather.value.condition;
    let temp = telemetry.weather.value.temperature;
    
    if (min >= 65 && min < 78) {
      cond = 'Light Rain';
      temp = 24.2;
    } else if (min >= 78) {
      cond = 'Lightning Risk';
      temp = 23.0;
    } else {
      cond = 'Overcast';
    }

    return {
      ...telemetry,
      weather: {
        value: { temperature: temp, condition: cond, windSpeed: 18 },
        lastUpdated: now,
        source: 'weather-station-1',
      },
    };
  },

  shouldTransition: (telemetry) => {
    return telemetry.matchTimeline.value.minute >= 90;
  },
};
