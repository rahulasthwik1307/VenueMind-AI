import { ActivityItem } from '@/types/incident';
import { Severity } from '@/types/common';
import { OperationalEvent } from '@/types/events';

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
      },
      {
        id: 'act-002',
        message: 'Medical unit 3 responded to sector C',
        actor: 'Medical Lead',
        time: minutesAgo(9),
        severity: 'medium',
      },
      {
        id: 'act-003',
        message: 'Lost child located — reunited with family',
        actor: 'Volunteer Team B',
        time: minutesAgo(20),
        severity: 'low',
      },
      {
        id: 'act-004',
        message: 'Transport Line 2 delay resolved',
        actor: 'Transport Coordinator',
        time: minutesAgo(32),
        severity: 'low',
      },
      {
        id: 'act-005',
        message: 'Sector D gates opened — capacity balanced',
        actor: 'Operations AI',
        time: minutesAgo(45),
      },
    ];
  }

  getActivities(): ActivityItem[] {
    return this.activities;
  }

  logActivity(message: string, actor: string, severity?: Severity) {
    const newActivity: ActivityItem = {
      id: `act-${Date.now()}-${Math.random()}`,
      message,
      actor,
      time: new Date().toISOString(),
      severity,
    };
    this.activities = [newActivity, ...this.activities];
    this.notify();
  }

  handleEvent(event: OperationalEvent) {
    switch (event.type) {
      case 'IncidentCreated': {
        const { title, severity } = event.payload;
        this.logActivity(`Alert: ${title} detected`, 'Security AI', severity);
        break;
      }
      case 'IncidentResolved': {
        const { title, severity } = event.payload;
        this.logActivity(`Resolved: ${title}`, 'Ops Manager', severity);
        break;
      }
      case 'IncidentStatusChanged': {
        const { title, status } = event.payload;
        const capStatus = status.charAt(0).toUpperCase() + status.slice(1);
        this.logActivity(`Status Update: ${title} is now ${capStatus}`, 'Operations Center');
        break;
      }
      case 'GoalScored': {
        const { scorer, score } = event.payload;
        this.logActivity(
          `Match Event: Goal! ${scorer} scores. New Score: Brazil ${score.home} - Argentina ${score.away}`,
          'Match Feed'
        );
        break;
      }
      case 'WeatherChanged': {
        const { condition, temperature } = event.payload;
        this.logActivity(
          `Environment Alert: Weather shifted to ${condition} (${temperature}°C)`,
          'Weather Station'
        );
        break;
      }
      case 'TransportDelay': {
        const { route, delayMinutes } = event.payload;
        this.logActivity(
          `Transport Alert: Route ${route} delay reports stand at ${delayMinutes} minutes`,
          'GPS Transit'
        );
        break;
      }
      case 'GateClosed': {
        const { gate } = event.payload;
        this.logActivity(`Facility Alert: Ingress routes to ${gate} are temporarily locked`, 'Turnstiles');
        break;
      }
      case 'RecommendationExecuted': {
        const { actionText } = event.payload;
        this.logActivity(`Dispatched: ${actionText}`, 'Ops Manager');
        break;
      }
      case 'RecommendationDismissed': {
        const { recTitle } = event.payload;
        this.logActivity(`Operator dismissed recommendations for: "${recTitle}"`, 'Ops Manager');
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
