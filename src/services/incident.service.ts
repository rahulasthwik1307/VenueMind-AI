import { Incident, TimelineEvent, TimelineEventType } from '@/types/incident';
import { IncidentStatus } from '@/types/common';
import { MOCK_INCIDENTS } from '@/data/mockIncidents';
import { OperationalEvent } from '@/types/events';

type IncidentListener = (incidents: Incident[]) => void;
type EventPublisher = (event: OperationalEvent) => void;

class IncidentService {
  private incidents: Incident[] = [];
  private listeners: IncidentListener[] = [];
  private eventPublisher: EventPublisher | null = null;

  constructor() {
    this.reset();
  }

  reset() {
    this.incidents = JSON.parse(JSON.stringify(MOCK_INCIDENTS));
    this.notify();
  }

  setEventPublisher(publisher: EventPublisher) {
    this.eventPublisher = publisher;
  }

  private triggerEvent(type: string, payload: any) {
    if (this.eventPublisher) {
      this.eventPublisher({
        id: `evt-${Date.now()}-${Math.random()}`,
        type: type as any,
        timestamp: new Date().toISOString(),
        payload,
      });
    }
  }

  getIncidents(): Incident[] {
    return this.incidents;
  }

  createIncident(data: Partial<Incident>): Incident {
    const now = new Date().toISOString();
    const newInc: Incident = {
      id: data.id || `inc-${Date.now()}`,
      title: data.title || 'New Incident',
      description: data.description || '',
      status: 'open',
      severity: data.severity || 'low',
      category: data.category || 'infrastructure',
      location: data.location || { lat: 25.45, lng: 51.34, zone: 'Stadium Wide' },
      reporterId: data.reporterId || 'system-sensor',
      createdAt: now,
      updatedAt: now,
      assignedTeam: data.assignedTeam,
      aiConfidence: data.aiConfidence || 85,
      timeline: data.timeline || [
        {
          id: `evt-${Date.now()}`,
          title: 'System Alert Raised',
          description: data.description || 'Automated sensor alert created.',
          timestamp: now,
          type: 'detection',
        },
      ],
      notes: '',
    };

    this.incidents = [...this.incidents, newInc];
    this.notify();
    this.triggerEvent('IncidentCreated', newInc);
    return newInc;
  }

  updateStatus(id: string, status: IncidentStatus) {
    let target: Incident | undefined;
    this.incidents = this.incidents.map((inc) => {
      if (inc.id === id) {
        target = inc;
        const now = new Date().toISOString();
        let type: TimelineEventType = 'system';
        if (status === 'investigating') type = 'operator_action';
        else if (status === 'mitigated') type = 'system';
        else if (status === 'resolved') type = 'resolution';

        const newEvent: TimelineEvent = {
          id: `evt-stat-${Date.now()}-${Math.random()}`,
          title: `Status Transition: ${status.toUpperCase()}`,
          description: `Incident operations response transitioned to ${status}.`,
          timestamp: now,
          type,
        };

        return {
          ...inc,
          status,
          updatedAt: now,
          timeline: [...inc.timeline, newEvent],
        };
      }
      return inc;
    });

    this.notify();
    if (target) {
      this.triggerEvent('IncidentStatusChanged', { title: target.title, status });
      if (status === 'resolved') {
        this.triggerEvent('IncidentResolved', target);
      }
    }
  }

  addTimelineEvent(id: string, event: Omit<TimelineEvent, 'id' | 'timestamp'>) {
    this.incidents = this.incidents.map((inc) => {
      if (inc.id === id) {
        const now = new Date().toISOString();
        const newEvt: TimelineEvent = {
          ...event,
          id: `evt-add-${Date.now()}-${Math.random()}`,
          timestamp: now,
        };
        return {
          ...inc,
          updatedAt: now,
          timeline: [...inc.timeline, newEvt],
        };
      }
      return inc;
    });
    this.notify();
  }

  updateNotes(id: string, notes: string) {
    this.incidents = this.incidents.map((inc) => {
      if (inc.id === id) {
        return {
          ...inc,
          notes,
          updatedAt: new Date().toISOString(),
        };
      }
      return inc;
    });
    this.notify();
  }

  subscribe(listener: IncidentListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.incidents));
  }
}

export const incidentService = new IncidentService();
