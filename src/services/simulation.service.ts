import { SimulationScenario } from './simulation/scenarios/scenario.interface';
import { preMatchScenario } from './simulation/scenarios/preMatch.scenario';
import { firstHalfScenario } from './simulation/scenarios/firstHalf.scenario';
import { halftimeScenario } from './simulation/scenarios/halftime.scenario';
import { secondHalfScenario } from './simulation/scenarios/secondHalf.scenario';
import { postMatchScenario } from './simulation/scenarios/postMatch.scenario';
import { telemetryService } from './telemetry.service';
import { operationsService } from './operations.service';
import { useIncidentStore } from '@/store/modules/incident';
import { StadiumTelemetry } from '@/types/telemetry';

const SCENARIOS: Record<string, SimulationScenario> = {
  'pre-match': preMatchScenario,
  'first-half': firstHalfScenario,
  halftime: halftimeScenario,
  'second-half': secondHalfScenario,
  'post-match': postMatchScenario,
};

class SimulationService {
  private activeScenario: SimulationScenario = preMatchScenario;
  private intervalId: NodeJS.Timeout | null = null;
  private secondCounter = 0;

  constructor() {
    this.reset();
  }

  reset() {
    this.secondCounter = 0;
    this.activeScenario = preMatchScenario;
    telemetryService.reset();
    
    // Initialize first scenario
    telemetryService.updateTelemetry((t) => this.activeScenario.initialize(t));
  }

  start() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick() {
    this.secondCounter += 1;
    let telemetry = telemetryService.getTelemetry();

    // 1. Tick Clock (Runs every 1 second)
    telemetry = this.activeScenario.tickClock(telemetry);

    // Check for goal score events during match to publish operational activities
    const prevScore = telemetryService.getTelemetry().matchTimeline.value.score;
    const nextScore = telemetry.matchTimeline.value.score;
    if (prevScore.home !== nextScore.home || prevScore.away !== nextScore.away) {
      let scorer = 'Brazil';
      if (nextScore.away > prevScore.away) scorer = 'Argentina';
      
      // Dispatch GoalScored operational event
      useIncidentStore.getState().addActivity(
        `Goal Scored: ${scorer}! Score stands at Brazil ${nextScore.home} - Argentina ${nextScore.away}`,
        'Match Feed'
      );
    }

    // 2. Tick Crowd (Runs every 5 seconds)
    if (this.secondCounter % 5 === 0) {
      telemetry = this.activeScenario.tickCrowd(telemetry);
    }

    // 3. Tick Transport (Runs every 10 seconds)
    if (this.secondCounter % 10 === 0) {
      telemetry = this.activeScenario.tickTransport(telemetry);
    }

    // 4. Tick Weather (Runs every 20 seconds)
    if (this.secondCounter % 20 === 0) {
      const prevWeather = telemetryService.getTelemetry().weather.value.condition;
      telemetry = this.activeScenario.tickWeather(telemetry);
      const nextWeather = telemetry.weather.value.condition;
      
      if (prevWeather !== nextWeather) {
        useIncidentStore.getState().addActivity(
          `Weather shifted to ${nextWeather} (${telemetry.weather.value.temperature}°C)`,
          'Weather Station'
        );
      }
    }

    // Save back to TelemetryService
    telemetryService.updateTelemetry(() => telemetry);

    // Call Operations Coordinator to process calculations
    operationsService.processTick(telemetry);

    // Check for scenario transitions
    if (this.activeScenario.shouldTransition(telemetry)) {
      this.transitionToNext(telemetry);
    }
  }

  private transitionToNext(telemetry: StadiumTelemetry) {
    const nextName = this.activeScenario.nextScenarioName;
    if (!nextName || !SCENARIOS[nextName]) return;

    const nextScenario = SCENARIOS[nextName];
    const initializedTelemetry = nextScenario.initialize(telemetry);
    
    this.activeScenario = nextScenario;
    this.secondCounter = 0;
    
    telemetryService.updateTelemetry(() => initializedTelemetry);
    
    // Log transition activity
    useIncidentStore.getState().addActivity(
      `Match Phase Transitioned: Entered ${nextName.toUpperCase()} scenario`,
      'System Director'
    );
    useIncidentStore.getState().addToast(
      `Stadium Operations: Phase entered "${nextName.toUpperCase()}"`,
      'info'
    );

    // Force operations re-process
    operationsService.processTick(initializedTelemetry);
  }

  getActiveScenarioName(): string {
    return this.activeScenario.name;
  }
}

export const simulationService = new SimulationService();
