import type { AssistantContext, AssistantDomain, AssistantIncidentSummary } from '@/types/assistant';

/**
 * VenueMind AI — Prompt Templates
 *
 * One template per interaction mode. Each wraps the operator-supplied context
 * in a <USER_QUERY> boundary (matching the prompt injection hardening in the
 * system prompt). The boundary instructs the model to treat this block as
 * data to reason about, not as override instructions.
 *
 * See prompts/system/index.ts — PROMPT INJECTION DEFENSE
 */

// ─── Incident-scoped Template ─────────────────────────────────────────────────

export function buildIncidentPrompt(incident: AssistantIncidentSummary, additionalQuery: string = ''): string {
  const incidentBlock = `
Incident ID: ${incident.id}
Title: ${incident.title}
Category: ${incident.category}
Severity: ${incident.severity}
Status: ${incident.status}
Location: Zone ${incident.zone} (${incident.lat.toFixed(4)}, ${incident.lng.toFixed(4)})
Description: ${incident.description}
AI Confidence: ${incident.aiConfidence ?? 'unknown'}%
Reported: ${incident.createdAt}
${incident.assignedTeam ? `Assigned Team: ${incident.assignedTeam}` : 'Assigned Team: Not yet assigned'}
${incident.notes ? `Operator Notes: ${incident.notes}` : ''}
`.trim();

  const queryPart = additionalQuery.trim()
    ? `\n\nOperator Question: ${additionalQuery}`
    : '';

  return `<USER_QUERY>
INCIDENT BRIEFING REQUEST

${incidentBlock}${queryPart}

Provide a full operational briefing for this incident including situation overview, risks, recommended response, and estimated impact.
</USER_QUERY>`;
}

// ─── Multi-incident Template ─────────────────────────────────────────────────

export function buildIncidentsPrompt(incidents: AssistantIncidentSummary[], additionalQuery: string = ''): string {
  const incidentsBlock = incidents.map(incident => `
Incident ID: ${incident.id}
Title: ${incident.title}
Category: ${incident.category}
Severity: ${incident.severity}
Status: ${incident.status}
Location: Zone ${incident.zone} (${incident.lat.toFixed(4)}, ${incident.lng.toFixed(4)})
Description: ${incident.description}
AI Confidence: ${incident.aiConfidence ?? 'unknown'}%
Reported: ${incident.createdAt}
${incident.assignedTeam ? `Assigned Team: ${incident.assignedTeam}` : 'Assigned Team: Not yet assigned'}
${incident.notes ? `Operator Notes: ${incident.notes}` : ''}
`.trim()).join('\n\n---\n\n');

  const queryPart = additionalQuery.trim()
    ? `\n\nOperator Question: ${additionalQuery}`
    : '';

  return `<USER_QUERY>
CONSOLIDATED MULTI-INCIDENT BRIEFING REQUEST

${incidentsBlock}${queryPart}

Provide a consolidated operational briefing and ranked prioritization for these incidents. For each incident, assess severity, flag cross-domain risks, and recommend the optimal response sequence and estimated impact.
</USER_QUERY>`;
}

// ─── Zone-scoped Template ─────────────────────────────────────────────────────

export function buildZonePrompt(zoneId: string, additionalQuery: string = ''): string {
  const queryPart = additionalQuery.trim()
    ? `\n\nOperator Question: ${additionalQuery}`
    : '';

  return `<USER_QUERY>
ZONE ANALYSIS REQUEST

Zone: ${zoneId}

The operator has selected this stadium zone for analysis. Based on available telemetry and current operational status, provide a briefing covering:
- Current conditions in this zone
- Risks to monitor
- Any recommended pre-emptive or reactive actions
- Estimated operational impact of current conditions${queryPart}
</USER_QUERY>`;
}

// ─── Domain Templates ─────────────────────────────────────────────────────────

const DOMAIN_CONTEXTS: Record<AssistantDomain, string> = {
  crowd: `DOMAIN: Crowd Management & Flow

Analyze the current crowd management situation across the stadium. Consider:
- Density distribution across sectors and gates
- Ingress/egress flow rates and predicted bottlenecks
- High-density areas requiring active monitoring
- Pre-emptive routing adjustments to prevent congestion
- Post-match dispersal planning if match phase warrants it`,

  transport: `DOMAIN: Transport & Logistics Intelligence

Analyze the current transport and logistics situation. Consider:
- Metro, bus, and shuttle service status and capacity
- Parking lot saturation and vehicle queue depth
- Recommended routing for incoming and departing spectators
- Any delays or disruptions on primary transport corridors
- Coordination with local traffic management`,

  emergency: `DOMAIN: Emergency Response Readiness

Analyze the current emergency preparedness and response status. Consider:
- Medical standby unit availability and positioning
- Open emergency access corridors and gate clearance
- Security posture and any active threat indicators
- Evacuation route status for all sectors
- Communication channel status between command teams`,

  accessibility: `DOMAIN: Accessibility Services Coordination

Analyze the current accessibility operations. Consider:
- Accessible entrance availability and queue status
- Wheelchair routing and elevator operational status
- Hearing assistance service deployment
- Assistance request queue and volunteer availability
- Any mobility-related incidents requiring escalation`,
};

export function buildDomainPrompt(domain: AssistantDomain, additionalQuery: string = ''): string {
  const domainContext = DOMAIN_CONTEXTS[domain];
  const queryPart = additionalQuery.trim()
    ? `\n\nOperator Question: ${additionalQuery}`
    : '';

  return `<USER_QUERY>
${domainContext}${queryPart}

Provide a full operational briefing for this domain including situation overview, current risks, recommended response actions, and estimated impact.
</USER_QUERY>`;
}

// ─── Free-form Query Template ─────────────────────────────────────────────────

export function buildFreeformPrompt(sanitizedQuery: string): string {
  return `<USER_QUERY>
${sanitizedQuery}
</USER_QUERY>`;
}

// ─── Context History Formatter ────────────────────────────────────────────────

export function buildConversationHistoryBlock(
  history: AssistantContext['conversationHistory']
): string {
  if (history.length === 0) return '';

  const lines = history
    .slice(-6) // Include last 3 exchanges (6 messages) for context
    .map((m) => `${m.role === 'user' ? 'Operator' : 'VenueMind AI'}: ${m.content}`)
    .join('\n');

  return `\n\nCONVERSATION HISTORY (most recent):\n${lines}\n`;
}

// ─── Master Template Builder ──────────────────────────────────────────────────

interface BuildUserPromptInput {
  query: string;
  context: AssistantContext;
  persona: string;
}

/**
 * Assembles the final user-turn prompt from the context and query.
 * Called from the server-side API route only.
 */
export function buildUserPrompt({ query, context }: BuildUserPromptInput): string {
  const historyBlock = buildConversationHistoryBlock(context.conversationHistory);

  let corePrompt: string;

  switch (context.mode) {
    case 'incident':
      corePrompt = context.incidentData
        ? buildIncidentPrompt(context.incidentData, query)
        : buildFreeformPrompt(query);
      break;

    case 'incidents':
      corePrompt = context.incidentsData && context.incidentsData.length > 0
        ? buildIncidentsPrompt(context.incidentsData, query)
        : buildFreeformPrompt(query);
      break;

    case 'zone':
      corePrompt = context.zoneId
        ? buildZonePrompt(context.zoneId, query)
        : buildFreeformPrompt(query);
      break;

    case 'domain':
      corePrompt = context.domain
        ? buildDomainPrompt(context.domain, query)
        : buildFreeformPrompt(query);
      break;

    case 'freeform':
    default:
      corePrompt = buildFreeformPrompt(query);
      break;
  }

  return `${historyBlock}${corePrompt}`.trim();
}
