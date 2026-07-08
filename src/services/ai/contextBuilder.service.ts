import type {
  AssistantQuery,
  AssistantContext,
  AssistantLanguage,
  AssistantQueryMode,
  AssistantDomain,
  Message,
  AssistantIncidentSummary,
} from '@/types/assistant';
import type { Incident } from '@/types/incident';
import type { StadiumTelemetry } from '@/types/telemetry';

// ─── Sanitization Constants ───────────────────────────────────────────────────

/** Hard cap on free-form query length before it is interpolated into a prompt */
const MAX_QUERY_LENGTH = 500;

/**
 * Pattern matching common prompt-injection phrases.
 * Matched text is replaced with [REDACTED] before the query enters a prompt template.
 * This is the client-side sanitization layer; the system prompt provides the server-side defense.
 */
const INJECTION_PATTERN =
  /\b(ignore previous|ignore all|disregard|forget instructions?|act as|pretend (you are|to be)|you are now|new persona|jailbreak|override|system prompt|assistant:|human:|<\|im_start\|>|<\|im_end\|>)\b/gi;

// ─── Pure Sanitization Function ───────────────────────────────────────────────

/**
 * Sanitize and length-cap raw operator query text before prompt interpolation.
 * Removes potential prompt injection phrases and enforces a hard character limit.
 *
 * @pure — no side effects, deterministic output
 */
export function sanitizeQuery(rawQuery: string): string {
  return rawQuery
    .slice(0, MAX_QUERY_LENGTH)
    .replace(INJECTION_PATTERN, '[REDACTED]')
    .trim();
}

/**
 * Helper to serialize incident details into client-side request payload summaries.
 */
function serializeIncident(incident: Incident): AssistantIncidentSummary {
  return {
    id: incident.id,
    title: incident.title,
    description: incident.description,
    status: incident.status,
    severity: incident.severity,
    category: incident.category,
    zone: incident.location.zone,
    lat: incident.location.lat,
    lng: incident.location.lng,
    createdAt: incident.createdAt,
    assignedTeam: incident.assignedTeam,
    aiConfidence: incident.aiConfidence,
    notes: incident.notes,
  };
}

// ─── Context Builder Input ────────────────────────────────────────────────────

export interface ContextBuilderInput {
  mode: AssistantQueryMode;
  rawQuery: string;
  language: AssistantLanguage;
  persona: string;
  conversationHistory: Message[];
  incident?: Incident | null;
  zoneId?: string | null;
  telemetry?: StadiumTelemetry | null;
  domain?: AssistantDomain;
  /** Array of incident IDs for multi-incident consolidated briefing ('incidents' mode) */
  incidentIds?: string[];
  /** Full incidents list from store to filter/serialize incident details */
  incidents?: Incident[];
}

// ─── Pure Context Builder ─────────────────────────────────────────────────────

/**
 * Assembles a typed AssistantQuery from all available context sources.
 *
 * This is the single shared reasoning entry point. Both the structured
 * context-selection mode and the free-form natural-language query mode
 * funnel through this same function — no duplicate logic paths.
 *
 * @pure — no side effects, no store reads, fully deterministic and testable
 */
export function buildAssistantQuery(input: ContextBuilderInput): AssistantQuery {
  const sanitizedQuery = sanitizeQuery(input.rawQuery);

  // Limit history passed to the API to keep request payloads bounded
  const boundedHistory = input.conversationHistory.slice(-10);

  const context: AssistantContext = {
    mode: input.mode,
    conversationHistory: boundedHistory,
    ...(input.incident?.id ? { incidentId: input.incident.id } : {}),
    ...(input.zoneId ? { zoneId: input.zoneId } : {}),
    ...(input.domain ? { domain: input.domain } : {}),
    ...(input.incidentIds && input.incidentIds.length > 0 ? { incidentIds: input.incidentIds } : {}),
  };

  // Serialize single incident context details
  if (input.incident) {
    context.incidentData = serializeIncident(input.incident);
  }

  // Serialize multiple incidents context details for consolidated briefing mode
  if (input.incidentIds && input.incidentIds.length > 0 && input.incidents) {
    const selected = input.incidents.filter((i) => input.incidentIds?.includes(i.id));
    if (selected.length > 0) {
      context.incidentsData = selected.map(serializeIncident);
    }
  }

  // Build the operator-facing query string enriched with structured context labels
  let query: string;

  switch (input.mode) {
    case 'incident':
      query =
        input.incident
          ? sanitizedQuery ||
            `Provide a full operational briefing for incident: ${input.incident.title} (${input.incident.severity} severity, ${input.incident.category} category) at ${input.incident.location.zone}.`
          : sanitizedQuery;
      break;

    case 'zone':
      query =
        input.zoneId
          ? sanitizedQuery || `Analyze zone ${input.zoneId} current operational status.`
          : sanitizedQuery;
      break;

    case 'domain':
      query =
        input.domain
          ? sanitizedQuery ||
            `Provide a full ${input.domain} domain operational briefing across the stadium.`
          : sanitizedQuery;
      break;

    case 'incidents': {
      const ids = input.incidentIds ?? [];
      query =
        sanitizedQuery ||
        (ids.length > 0
          ? `Provide a consolidated operational briefing and ranked prioritization for the following ${ids.length} incident(s): ${ids.join(', ')}. For each incident, assess severity, flag cross-domain risks, and recommend the optimal response sequence.`
          : 'Provide a ranked prioritization of all currently open incidents and recommend an optimal response sequence.');
      break;
    }

    case 'freeform':
    default:
      query = sanitizedQuery;
      break;
  }

  return {
    query,
    context,
    persona: input.persona,
    language: input.language,
  };
}
