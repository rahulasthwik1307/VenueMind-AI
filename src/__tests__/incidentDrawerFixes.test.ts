import { describe, it, expect } from 'vitest';
import { shouldDisableActions } from '@/components/cards/DecisionCard';
import { aiStructuredResponseSchema } from '@/schemas/assistant.schema';

describe('DecisionCard locking logic', () => {
  it('should disable actions if incident is resolved', () => {
    expect(shouldDisableActions('resolved', false)).toBe(true);
    expect(shouldDisableActions('resolved', true)).toBe(true);
  });

  it('should disable actions if recommendation is already executed', () => {
    expect(shouldDisableActions('investigating', true)).toBe(true);
    expect(shouldDisableActions('open', true)).toBe(true);
  });

  it('should keep actions active if incident is open/investigating and recommendation is not executed', () => {
    expect(shouldDisableActions('open', false)).toBe(false);
    expect(shouldDisableActions('investigating', false)).toBe(false);
  });
});

describe('Non-operational response schema validation', () => {
  it('should successfully parse a valid non-operational response structure', () => {
    const payload = {
      situationOverview: 'Hello! I am VenueMind AI, your Stadium Operations Assistant.',
      expectedRisks: 'No operational risks identified for casual queries.',
      recommendedResponse: 'Please submit a query related to stadium operations.',
      estimatedImpact: 'No downstream operational impact.',
      confidence: 100,
      isNonOperational: true,
    };
    const parsed = aiStructuredResponseSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.isNonOperational).toBe(true);
  });

  it('should successfully parse a standard operational response structure', () => {
    const payload = {
      situationOverview: 'Crowd density is building up at Gate A South Entrance.',
      expectedRisks: 'Congestion could lead to entry delays or crowd crush.',
      recommendedResponse: 'Open Gate B and divert volunteers to guide people.',
      estimatedImpact: 'Reduces Gate A queue by 20% in 10 minutes.',
      confidence: 90,
      isNonOperational: false,
    };
    const parsed = aiStructuredResponseSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.isNonOperational).toBe(false);
  });
});
