/**
 * Unit tests for schemas/assistant.schema.ts
 *
 * Tests that:
 * - Valid AI response data passes aiStructuredResponseSchema
 * - Missing fields cause validation failure
 * - Out-of-range confidence values fail
 * - Too-short string fields fail the min() constraint
 *
 * All tests are pure — no API calls, no I/O, no React components.
 */

import { describe, it, expect } from 'vitest';
import { aiStructuredResponseSchema, assistantRequestSchema } from '@/schemas/assistant.schema';

// ─── aiStructuredResponseSchema ───────────────────────────────────────────────

describe('aiStructuredResponseSchema', () => {
  const validResponse = {
    situationOverview: 'Crowd density in Sector North is above safe threshold at 94% capacity.',
    expectedRisks: 'Risk of crush at Gate A if crowd continues to enter without redirection.',
    recommendedResponse: 'Deploy crowd stewards to Gate A immediately and open Gate B overflow.',
    estimatedImpact: 'Estimated 12-minute resolution with no significant crowd injury risk.',
    confidence: 87,
  };

  it('passes for a valid complete response', () => {
    const result = aiStructuredResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it('passes at confidence boundary: 0', () => {
    const result = aiStructuredResponseSchema.safeParse({ ...validResponse, confidence: 0 });
    expect(result.success).toBe(true);
  });

  it('passes at confidence boundary: 100', () => {
    const result = aiStructuredResponseSchema.safeParse({ ...validResponse, confidence: 100 });
    expect(result.success).toBe(true);
  });

  it('fails when situationOverview is missing', () => {
    const without = { expectedRisks: validResponse.expectedRisks, recommendedResponse: validResponse.recommendedResponse, estimatedImpact: validResponse.estimatedImpact, confidence: validResponse.confidence };
    const result = aiStructuredResponseSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it('fails when expectedRisks is missing', () => {
    const without = { situationOverview: validResponse.situationOverview, recommendedResponse: validResponse.recommendedResponse, estimatedImpact: validResponse.estimatedImpact, confidence: validResponse.confidence };
    const result = aiStructuredResponseSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it('fails when recommendedResponse is missing', () => {
    const without = { situationOverview: validResponse.situationOverview, expectedRisks: validResponse.expectedRisks, estimatedImpact: validResponse.estimatedImpact, confidence: validResponse.confidence };
    const result = aiStructuredResponseSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it('fails when estimatedImpact is missing', () => {
    const without = { situationOverview: validResponse.situationOverview, expectedRisks: validResponse.expectedRisks, recommendedResponse: validResponse.recommendedResponse, confidence: validResponse.confidence };
    const result = aiStructuredResponseSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it('fails when confidence is missing', () => {
    const without = { situationOverview: validResponse.situationOverview, expectedRisks: validResponse.expectedRisks, recommendedResponse: validResponse.recommendedResponse, estimatedImpact: validResponse.estimatedImpact };
    const result = aiStructuredResponseSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  it('fails when confidence is below 0', () => {
    const result = aiStructuredResponseSchema.safeParse({ ...validResponse, confidence: -1 });
    expect(result.success).toBe(false);
  });

  it('fails when confidence is above 100', () => {
    const result = aiStructuredResponseSchema.safeParse({ ...validResponse, confidence: 101 });
    expect(result.success).toBe(false);
  });

  it('fails when confidence is a non-integer float', () => {
    const result = aiStructuredResponseSchema.safeParse({ ...validResponse, confidence: 85.5 });
    expect(result.success).toBe(false);
  });

  it('fails when situationOverview is too short (< 10 chars)', () => {
    const result = aiStructuredResponseSchema.safeParse({
      ...validResponse,
      situationOverview: 'Short',
    });
    expect(result.success).toBe(false);
  });

  it('fails when estimatedImpact is too short (< 5 chars)', () => {
    const result = aiStructuredResponseSchema.safeParse({
      ...validResponse,
      estimatedImpact: 'OK',
    });
    expect(result.success).toBe(false);
  });

  it('fails when confidence is a string', () => {
    const result = aiStructuredResponseSchema.safeParse({
      ...validResponse,
      confidence: '87',
    });
    expect(result.success).toBe(false);
  });

  it('fails on empty object', () => {
    const result = aiStructuredResponseSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('fails on null', () => {
    const result = aiStructuredResponseSchema.safeParse(null);
    expect(result.success).toBe(false);
  });
});

// ─── assistantRequestSchema ───────────────────────────────────────────────────

describe('assistantRequestSchema', () => {
  const validRequest = {
    query: 'What is the crowd risk at Gate D right now?',
    context: {
      mode: 'freeform',
      conversationHistory: [],
    },
    persona: 'operations',
    language: 'en',
  };

  it('passes for a valid freeform request', () => {
    const result = assistantRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it('passes for a valid incident mode request with incidentId', () => {
    const result = assistantRequestSchema.safeParse({
      ...validRequest,
      context: {
        mode: 'incident',
        incidentId: 'inc-001',
        conversationHistory: [],
      },
    });
    expect(result.success).toBe(true);
  });

  it('passes for a valid domain mode request', () => {
    const result = assistantRequestSchema.safeParse({
      ...validRequest,
      context: { mode: 'domain', domain: 'crowd', conversationHistory: [] },
    });
    expect(result.success).toBe(true);
  });

  it('passes for all supported languages', () => {
    for (const lang of ['en', 'es', 'fr', 'pt', 'hi'] as const) {
      const result = assistantRequestSchema.safeParse({ ...validRequest, language: lang });
      expect(result.success).toBe(true);
    }
  });

  it('fails for an unsupported language', () => {
    const result = assistantRequestSchema.safeParse({ ...validRequest, language: 'zh' });
    expect(result.success).toBe(false);
  });

  it('fails when query is empty', () => {
    const result = assistantRequestSchema.safeParse({ ...validRequest, query: '' });
    expect(result.success).toBe(false);
  });

  it('fails when mode is invalid', () => {
    const result = assistantRequestSchema.safeParse({
      ...validRequest,
      context: { mode: 'invalid_mode', conversationHistory: [] },
    });
    expect(result.success).toBe(false);
  });

  it('fails when domain is invalid', () => {
    const result = assistantRequestSchema.safeParse({
      ...validRequest,
      context: { mode: 'domain', domain: 'unknown_domain', conversationHistory: [] },
    });
    expect(result.success).toBe(false);
  });

  it('fails when conversationHistory exceeds 10 items', () => {
    const tooManyMessages = Array.from({ length: 11 }, (_, i) => ({
      id: `msg-${i}`,
      role: 'user' as const,
      content: `Message ${i}`,
      timestamp: '2026-07-08T00:00:00.000Z',
    }));
    const result = assistantRequestSchema.safeParse({
      ...validRequest,
      context: { mode: 'freeform', conversationHistory: tooManyMessages },
    });
    expect(result.success).toBe(false);
  });

  it('fails when persona is empty', () => {
    const result = assistantRequestSchema.safeParse({ ...validRequest, persona: '' });
    expect(result.success).toBe(false);
  });

  it('fails on missing required fields', () => {
    const result = assistantRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
