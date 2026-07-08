import { z } from 'zod';

// ─── Message & Session ────────────────────────────────────────────────────────

export const messageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  timestamp: z.string().datetime(),
});

export const assistantSessionSchema = z.object({
  id: z.string(),
  persona: z.string(),
  messages: z.array(messageSchema),
  createdAt: z.string().datetime(),
});

// ─── Structured AI Response ───────────────────────────────────────────────────

/**
 * Every Groq response is validated against this schema before it enters
 * the application. Raw API data never reaches the store or UI.
 * See ARCHITECTURE.md — Validation.
 */
export const aiStructuredResponseSchema = z.object({
  situationOverview: z.string().min(10).max(3000),
  expectedRisks: z.string().min(10).max(3000),
  recommendedResponse: z.string().min(10).max(3000),
  estimatedImpact: z.string().min(5).max(1000),
  confidence: z.number().int().min(0).max(100),
});

export type AIStructuredResponseSchema = z.infer<typeof aiStructuredResponseSchema>;

export const assistantIncidentSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.string(),
  severity: z.string(),
  category: z.string(),
  zone: z.string(),
  lat: z.number(),
  lng: z.number(),
  createdAt: z.string(),
  assignedTeam: z.string().optional(),
  aiConfidence: z.number().optional(),
  notes: z.string().optional(),
});

export const assistantRequestSchema = z.object({
  query: z.string().min(1).max(1000),
  context: z.object({
    mode: z.enum(['incident', 'zone', 'domain', 'freeform', 'incidents']),
    incidentId: z.string().optional(),
    incidentIds: z.array(z.string()).optional(),
    incidentData: assistantIncidentSummarySchema.optional(),
    incidentsData: z.array(assistantIncidentSummarySchema).optional(),
    zoneId: z.string().optional(),
    domain: z.enum(['crowd', 'transport', 'emergency', 'accessibility']).optional(),
    conversationHistory: z
      .array(
        z.object({
          id: z.string(),
          role: z.enum(['user', 'assistant', 'system']),
          content: z.string(),
          timestamp: z.string(),
        })
      )
      .max(10),
  }),
  persona: z.string().min(1).max(100),
  language: z.enum(['en', 'es', 'fr', 'pt', 'hi']),
});

export type AssistantRequestSchema = z.infer<typeof assistantRequestSchema>;
