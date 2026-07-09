import { ActivityItem } from '@/types/incident';
import { Severity } from '@/types/common';
import { OperationalEvent } from '@/types/events';
import { telemetryService } from './telemetry.service';

type ActivityListener = (activities: ActivityItem[]) => void;

class ActivityService {
  private activities: ActivityItem[] = [];
  private listeners: ActivityListener[] = [];

  constructor() {
    this.reset();
  }

  reset() {
    const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000).toISOString();
    this.activities = [
      {
        id: 'act-001',
        message: 'Security team deployed to Gate 7',
        actor: 'Ops Manager',
        time: minutesAgo(3),
        severity: 'high',
        matchPhase: 'pre-match',
      },
      {
        id: 'act-002',
        message: 'Medical unit 3 responded to sector C',
        actor: 'Medical Lead',
        time: minutesAgo(9),
        severity: 'medium',
        matchPhase: 'pre-match',
      },
      {
        id: 'act-003',
        message: 'Lost child located — reunited with family',
        actor: 'Volunteer Team B',
        time: minutesAgo(20),
        severity: 'low',
        matchPhase: 'pre-match',
      },
      {
        id: 'act-004',
        message: 'Transport Line 2 delay resolved',
        actor: 'Transport Coordinator',
        time: minutesAgo(32),
        severity: 'low',
        matchPhase: 'pre-match',
      },
      {
        id: 'act-005',
        message: 'Sector D gates opened — capacity balanced',
        actor: 'Operations AI',
        time: minutesAgo(45),
        matchPhase: 'pre-match',
      },
    ];
    this.notify();
  }

  getActivities(): ActivityItem[] {
    return this.activities;
  }

  logActivity(
    message: string,
    actor: string,
    severity?: Severity,
    incidentId?: string,
    matchPhase?: string
  ) {
    const period =
      matchPhase ??
      telemetryService.getTelemetry()?.matchTimeline?.value?.period ??
      'pre-match';

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}-${Math.random()}`,
      message,
      actor,
      time: new Date().toISOString(),
      severity,
      incidentId,
      matchPhase: period,
    };
    const MAX_ACTIVITIES = 100;
    this.activities = [newActivity, ...this.activities].slice(0, MAX_ACTIVITIES);
    this.notify();
  }

  handleEvent(event: OperationalEvent) {
    const period = telemetryService.getTelemetry()?.matchTimeline?.value?.period ?? 'pre-match';
    
    switch (event.type) {
      case 'IncidentCreated': {
        const { id, title, severity } = event.payload;
        this.logActivity(`Alert: ${title} detected`, 'Security AI', severity, id, period);
        break;
      }
      case 'IncidentResolved': {
        const { id, title, severity } = event.payload;
        this.logActivity(`Resolved: ${title}`, 'Ops Manager', severity, id, period);
        break;
      }
      case 'IncidentStatusChanged': {
        const { incidentId, title, status } = event.payload;
        const capStatus = status.charAt(0).toUpperCase() + status.slice(1);
        this.logActivity(`Status Update: ${title} is now ${capStatus}`, 'Operations Center', undefined, incidentId, period);
        break;
      }
      case 'GoalScored': {
        const { scorer, score } = event.payload;
        this.logActivity(
          `Match Event: Goal! ${scorer} scores. New Score: Brazil ${score.home} - Argentina ${score.away}`,
          'Match Feed',
          undefined,
          undefined,
          period
        );
        break;
      }
      case 'WeatherChanged': {
        const { condition, temperature } = event.payload;
        this.logActivity(
          `Environment Alert: Weather shifted to ${condition} (${temperature}°C)`,
          'Weather Station',
          undefined,
          undefined,
          period
        );
        break;
      }
      case 'TransportDelay': {
        const { route, delayMinutes } = event.payload;
        this.logActivity(
          `Transport Alert: Route ${route} delay reports stand at ${delayMinutes} minutes`,
          'GPS Transit',
          undefined,
          undefined,
          period
        );
        break;
      }
      case 'GateClosed': {
        const { gate } = event.payload;
        this.logActivity(`Facility Alert: Ingress routes to ${gate} are temporarily locked`, 'Turnstiles', undefined, undefined, period);
        break;
      }
      case 'RecommendationExecuted': {
        const { incidentId, actionText } = event.payload;
        this.logActivity(`Dispatched: ${actionText}`, 'Ops Manager', undefined, incidentId, period);
        break;
      }
      case 'RecommendationDismissed': {
        const { incidentId, recTitle } = event.payload;
        this.logActivity(`Operator dismissed recommendations for: "${recTitle}"`, 'Ops Manager', undefined, incidentId, period);
        break;
      }
    }
  }

  subscribe(listener: ActivityListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.activities));
  }
}

export const activityService = new ActivityService();
