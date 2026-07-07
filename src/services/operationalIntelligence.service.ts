import { Incident, IncidentAnalysis, Recommendation } from '@/types/incident';
import { StadiumTelemetry } from '@/types/telemetry';
import { MOCK_ANALYSES } from '@/data/mockAnalyses';
import { OperationalEvent } from '@/types/events';

type AnalysisListener = (analyses: Record<string, IncidentAnalysis>) => void;
type EventPublisher = (event: OperationalEvent) => void;

class OperationalIntelligenceService {
  private analyses: Record<string, IncidentAnalysis> = {};
  private listeners: AnalysisListener[] = [];
  private eventPublisher: EventPublisher | null = null;

  constructor() {
    this.reset();
  }

  reset() {
    this.analyses = JSON.parse(JSON.stringify(MOCK_ANALYSES));
    this.notify();
  }

  setEventPublisher(publisher: EventPublisher) {
    this.eventPublisher = publisher;
  }

  private triggerEvent(type: string, payload: any) {
    if (this.eventPublisher) {
      this.eventPublisher({
        id: `evt-intel-${Date.now()}-${Math.random()}`,
        type: type as any,
        timestamp: new Date().toISOString(),
        payload,
      });
    }
  }

  getAnalyses(): Record<string, IncidentAnalysis> {
    return this.analyses;
  }

  // Regenerate analyses dynamically based on current telemetry
  updateAnalysesWithTelemetry(incidents: Incident[], telemetry: StadiumTelemetry) {
    const updatedAnalyses: Record<string, IncidentAnalysis> = {};

    incidents.forEach((inc) => {
      let analysis = this.analyses[inc.id];
      if (!analysis) {
        analysis = this.createDefaultAnalysis(inc);
      }

      // Modulate recommendations based on telemetry
      const modulatedRecommendations = analysis.recommendations.map((rec) => {
        let confidence = rec.confidence;
        let priority = rec.priority;
        let eta = rec.eta;

        // Apply crowd density modifications
        if (inc.category === 'crowd' && telemetry.crowdDensity.value > 80) {
          confidence = Math.min(99, rec.confidence + 2);
          if (rec.id === 'rec-1-1') priority = 'critical'; // Redirect crowd becomes critical when capacity approaches peak
        }

        // Apply weather condition modifications
        if (inc.category === 'weather' && telemetry.weather.value.condition === 'Lightning Risk') {
          priority = 'critical';
          eta = 'Immediate';
        }

        // Apply transport sags modifications
        if (inc.category === 'transport' && telemetry.transportStatus.value === 'Critical') {
          priority = 'critical';
          confidence = Math.max(90, rec.confidence + 5);
        }

        return {
          ...rec,
          confidence,
          priority,
          eta,
        };
      });

      updatedAnalyses[inc.id] = {
        ...analysis,
        recommendations: modulatedRecommendations,
      };
    });

    this.analyses = updatedAnalyses;
    this.notify();
  }

  executeRecommendation(incidentId: string, recommendationId: string) {
    const analysis = this.analyses[incidentId];
    if (!analysis) return;

    let targetRec: Recommendation | undefined;
    const updatedRecommendations = analysis.recommendations.map((rec) => {
      if (rec.id === recommendationId) {
        targetRec = rec;
        return { ...rec, executed: true };
      }
      return rec;
    });

    this.analyses[incidentId] = {
      ...analysis,
      recommendations: updatedRecommendations,
    };

    this.notify();
    if (targetRec) {
      this.triggerEvent('RecommendationExecuted', {
        incidentId,
        recId: recommendationId,
        recTitle: targetRec.title,
        actionText: targetRec.action,
      });
    }
  }

  dismissRecommendation(incidentId: string, recommendationId: string) {
    const analysis = this.analyses[incidentId];
    if (!analysis) return;

    let targetRec: Recommendation | undefined;
    const updatedRecommendations = analysis.recommendations.map((rec) => {
      if (rec.id === recommendationId) {
        targetRec = rec;
        return { ...rec, dismissed: true };
      }
      return rec;
    });

    this.analyses[incidentId] = {
      ...analysis,
      recommendations: updatedRecommendations,
    };

    this.notify();
    if (targetRec) {
      this.triggerEvent('RecommendationDismissed', {
        incidentId,
        recId: recommendationId,
        recTitle: targetRec.title,
      });
    }
  }

  private createDefaultAnalysis(incident: Incident): IncidentAnalysis {
    return {
      incidentId: incident.id,
      aiSituationSummary: {
        explanation: `AI model evaluates a minor threshold anomaly for ${incident.title} in zone ${incident.location.zone}. Immediate escalation is not predicted.`,
        expectedRisks: 'Localized spectator inconvenience; minor delay in ingress routing.',
        recommendedResponse: 'Dispatch nearest support volunteer and verify SCADA telemetry nodes.',
      },
      nearbyFacilities: [
        { name: 'Volunteer Center North', distance: '120m away', type: 'staff' },
        { name: 'First Aid Post 2', distance: '240m away', type: 'medical' },
      ],
      estimatedImpact: 'Low operational priority. Minimal spectator disturbance.',
      recommendations: [
        {
          id: `rec-def-1-${incident.id}`,
          title: 'Dispatch Standby Staff',
          explanation: 'Send nearby concourse volunteers to verify the status code locally.',
          action: `Deploy steward to ${incident.location.zone}`,
          confidence: 84,
          expectedImpact: 'Verify status within 3 minutes.',
          eta: '3 mins',
          priority: 'low',
          executed: false,
        },
      ],
    };
  }

  subscribe(listener: AnalysisListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.analyses));
  }
}

export const operationalIntelligenceService = new OperationalIntelligenceService();
