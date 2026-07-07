import { telemetryService } from './telemetry.service';
import { incidentService } from './incident.service';
import { operationalIntelligenceService } from './operationalIntelligence.service';
import { activityService } from './activity.service';
import { StadiumTelemetry } from '@/types/telemetry';
import { OperationalEvent } from '@/types/events';
import { useIncidentStore } from '@/store/modules/incident';

class OperationsService {
  // Track active ticks for incidents under response
  private incidentResponseTicks: Record<string, number> = {};

  constructor() {
    // Wire up the event publication pipeline
    const eventHandler = (event: OperationalEvent) => this.handleOperationalEvent(event);
    incidentService.setEventPublisher(eventHandler);
    operationalIntelligenceService.setEventPublisher(eventHandler);
  }

  // Orchestrate events across services
  private handleOperationalEvent(event: OperationalEvent) {
    // 1. Log the activity
    activityService.handleEvent(event);

    // 2. If a recommendation was executed, transition the incident to investigating
    if (event.type === 'RecommendationExecuted') {
      const { incidentId } = event.payload;
      const incident = incidentService.getIncidents().find((i) => i.id === incidentId);
      if (incident && incident.status === 'open') {
        incidentService.updateStatus(incidentId, 'investigating');
      }
    }

    // 3. Dispatch global toast notifications through the store
    if (event.type === 'IncidentCreated') {
      const incident = event.payload;
      const addToast = useIncidentStore.getState().addToast;
      if (incident.severity === 'critical') {
        addToast(`CRITICAL INCIDENT: ${incident.title} in ${incident.location.zone}`, 'error');
      } else if (incident.severity === 'high' || incident.severity === 'medium') {
        addToast(`Incident Alert: ${incident.title} (${incident.location.zone})`, 'warning');
      }
    } else if (event.type === 'RecommendationExecuted') {
      const { recTitle } = event.payload;
      const addToast = useIncidentStore.getState().addToast;
      addToast(`Dispatched Tactical Action: ${recTitle}`, 'success');
    } else if (event.type === 'IncidentResolved') {
      const { title } = event.payload;
      const addToast = useIncidentStore.getState().addToast;
      addToast(`Incident Resolved: ${title}`, 'success');
    }

    // 4. Update the global state
    this.pushStateToZustand();
  }

  // Main tick entry point called by the Simulation scheduler
  processTick(telemetry: StadiumTelemetry) {
    const incidents = incidentService.getIncidents();

    // 1. Evaluate auto-escalations based on telemetry sags
    this.evaluateAutoEscalations(telemetry);

    // 2. Process active incident response lifecycles
    this.progressIncidentLifecycles();

    // 3. Regenerate analyses and recommendations
    operationalIntelligenceService.updateAnalysesWithTelemetry(incidents, telemetry);

    // 4. Publish updated state to UI
    this.pushStateToZustand();
  }

  // Check telemetry thresholds and auto-create/re-open incident tickets
  private evaluateAutoEscalations(telemetry: StadiumTelemetry) {
    const incidents = incidentService.getIncidents();

    // Ingress Turnstile Scanner failures
    if (telemetry.systemHealth.value.ticketing === 'Degraded') {
      const turnstileInc = incidents.find((i) => i.id === 'inc-005');
      if (turnstileInc && turnstileInc.status === 'resolved') {
        // Re-open turnstile ticket since ticketing degraded again
        incidentService.updateStatus('inc-005', 'open');
        incidentService.addTimelineEvent('inc-005', {
          title: 'Network Degradation Recurred',
          description: 'Turnstile ticketing gateways show degraded network ping responses.',
          type: 'detection',
        });
      }
    }

    // VIP West Elevator fault
    if (telemetry.systemHealth.value.scada === 'Degraded') {
      const elevatorInc = incidents.find((i) => i.id === 'inc-010');
      if (elevatorInc && elevatorInc.status === 'resolved') {
        incidentService.updateStatus('inc-010', 'open');
        incidentService.addTimelineEvent('inc-010', {
          title: 'Mechanical Error Recurred',
          description: 'Door interlock telemetry sensors reported door-lock failure code E-402.',
          type: 'detection',
        });
      }
    }

    // Heavy storm & lightning hazard
    if (telemetry.weather.value.condition === 'Lightning Risk') {
      const stormInc = incidents.find((i) => i.id === 'inc-007');
      if (stormInc && stormInc.status === 'resolved') {
        incidentService.updateStatus('inc-007', 'open');
        incidentService.addTimelineEvent('inc-007', {
          title: 'Lightning Strike Detected',
          description: 'Radar reports convective cell strike within 2km perimeter of stadium.',
          type: 'detection',
        });
      }
    }
  }

  // Automated responder lifecycle simulation
  private progressIncidentLifecycles() {
    const incidents = incidentService.getIncidents();

    incidents.forEach((inc) => {
      if (inc.status === 'resolved') {
        delete this.incidentResponseTicks[inc.id];
        return;
      }

      // If operator has dispatched an action and it is investigating
      if (inc.status === 'investigating') {
        const ticks = (this.incidentResponseTicks[inc.id] || 0) + 1;
        this.incidentResponseTicks[inc.id] = ticks;

        // After 4 ticks (32 seconds), transition to mitigated
        if (ticks >= 4) {
          incidentService.updateStatus(inc.id, 'mitigated');
          incidentService.addTimelineEvent(inc.id, {
            title: 'Tactical Mitigation Verified',
            description: 'AI sensors confirm crowd/facility parameters are stabilizing under dispatch actions.',
            type: 'system',
          });
        }
      }

      // If mitigated and not critical severity, auto-resolve after another 4 ticks
      if (inc.status === 'mitigated') {
        const ticks = (this.incidentResponseTicks[inc.id] || 0) + 1;
        this.incidentResponseTicks[inc.id] = ticks;

        if (ticks >= 8 && inc.severity !== 'critical') {
          incidentService.updateStatus(inc.id, 'resolved');
        }
      }
    });
  }

  // Push batch updates directly to the Zustand store
  pushStateToZustand() {
    const updateState = useIncidentStore.getState().updateState;
    updateState({
      telemetry: telemetryService.getTelemetry(),
      incidents: incidentService.getIncidents(),
      analyses: operationalIntelligenceService.getAnalyses(),
      activities: activityService.getActivities(),
    });
  }

  // Manual actions called from the UI
  dispatchRecommendation(incidentId: string, recommendationId: string) {
    operationalIntelligenceService.executeRecommendation(incidentId, recommendationId);
  }

  dismissRecommendation(incidentId: string, recommendationId: string) {
    operationalIntelligenceService.dismissRecommendation(incidentId, recommendationId);
  }

  resolveIncident(incidentId: string) {
    incidentService.updateStatus(incidentId, 'resolved');
  }

  updateIncidentNotes(incidentId: string, notes: string) {
    incidentService.updateNotes(incidentId, notes);
    this.pushStateToZustand();
  }
}

export const operationsService = new OperationsService();
