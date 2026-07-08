// ─── Core Message & Session ───────────────────────────────────────────────────

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface AssistantSession {
  id: string;
  persona: string;
  messages: Message[];
  createdAt: string;
}

// ─── Structured AI Response ───────────────────────────────────────────────────

/**
 * The canonical structured response shape returned by every AI call.
 * This maps 1-to-1 with what AIContextPanel and AIResponseCard render,
 * ensuring both the Digital Twin panel and Command Center use the same type.
 */
export interface AIStructuredResponse {
  /** Concise factual description of the current operational situation */
  situationOverview: string;
  /** Predicted risks if the situation is left unaddressed */
  expectedRisks: string;
  /** Specific recommended operator actions */
  recommendedResponse: string;
  /** Estimated downstream impact on stadium operations */
  estimatedImpact: string;
  /** AI confidence in this assessment, 0–100 */
  confidence: number;
}

// ─── Query & Context ──────────────────────────────────────────────────────────

export type AssistantQueryMode = 'incident' | 'zone' | 'domain' | 'freeform' | 'incidents';

export type AssistantDomain = 'crowd' | 'transport' | 'emergency' | 'accessibility';

export type AssistantLanguage = 'en' | 'es' | 'fr' | 'pt' | 'hi';

export interface AssistantIncidentSummary {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  category: string;
  zone: string;
  lat: number;
  lng: number;
  createdAt: string;
  assignedTeam?: string;
  aiConfidence?: number;
  notes?: string;
}

export interface AssistantContext {
  mode: AssistantQueryMode;
  incidentId?: string;
  /** Array of incident IDs for multi-incident consolidated briefing mode */
  incidentIds?: string[];
  incidentData?: AssistantIncidentSummary;
  incidentsData?: AssistantIncidentSummary[];
  zoneId?: string;
  domain?: AssistantDomain;
  /** Last N messages from session history sent as context */
  conversationHistory: Message[];
}

export interface AssistantQuery {
  query: string;
  context: AssistantContext;
  persona: string;
  language: AssistantLanguage;
}

// ─── Error Handling ───────────────────────────────────────────────────────────

export type AssistantErrorType =
  | 'network'
  | 'validation'
  | 'timeout'
  | 'rate_limit'
  | 'unauthorized'
  | 'unknown';

export interface AssistantError {
  type: AssistantErrorType;
  message: string;
}

// ─── Service Return Types ─────────────────────────────────────────────────────

export interface AssistantResult {
  success: true;
  data: AIStructuredResponse;
}

export interface AssistantFailure {
  success: false;
  error: AssistantError;
}

export type AssistantServiceResult = AssistantResult | AssistantFailure;

// ─── Store Input ──────────────────────────────────────────────────────────────

import type { Incident } from './incident';

/**
 * The minimal input surface the Command Center page passes to the assistant store.
 * The store action assembles the full AssistantQuery internally.
 */
export interface SubmitQueryInput {
  mode: AssistantQueryMode;
  /** Raw, unsanitized query text from the operator */
  rawQuery: string;
  persona?: string;
  incident?: Incident | null;
  zoneId?: string | null;
  domain?: AssistantDomain;
  /** Array of incident IDs for multi-incident consolidated briefing mode */
  incidentIds?: string[];
}
