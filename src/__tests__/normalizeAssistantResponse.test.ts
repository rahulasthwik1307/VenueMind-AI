import { describe, it, expect } from 'vitest';
import { normalizeAssistantResponse } from '@/app/api/assistant/route';

describe('normalizeAssistantResponse helper', () => {
  describe('confidence coercion', () => {
    it('should coerce valid numeric string to a number', () => {
      const input = { confidence: '92' };
      const output = normalizeAssistantResponse(input) as { confidence: unknown };
      expect(output.confidence).toBe(92);
    });

    it('should coerce valid numeric string with percent sign to a number', () => {
      const input = { confidence: ' 85.5% ' };
      const output = normalizeAssistantResponse(input) as { confidence: unknown };
      expect(output.confidence).toBe(85.5);
    });

    it('should leave already numeric confidence unchanged', () => {
      const input = { confidence: 99 };
      const output = normalizeAssistantResponse(input) as { confidence: unknown };
      expect(output.confidence).toBe(99);
      expect(output).toBe(input); // Should return same object reference if nothing coerced
    });

    it('should leave invalid confidence strings as-is', () => {
      const input = { confidence: 'high' };
      const output = normalizeAssistantResponse(input) as { confidence: unknown };
      expect(output.confidence).toBe('high');
      expect(output).toBe(input); // Should not modify the object
    });

    it('should leave empty confidence strings as-is', () => {
      const input = { confidence: '' };
      const output = normalizeAssistantResponse(input) as { confidence: unknown };
      expect(output.confidence).toBe('');
      expect(output).toBe(input);
    });
  });

  describe('isNonOperational coercion', () => {
    it('should coerce string true/TRUE to boolean true', () => {
      const input1 = { isNonOperational: 'true' };
      const input2 = { isNonOperational: '  TRUE ' };
      expect((normalizeAssistantResponse(input1) as Record<string, unknown>).isNonOperational).toBe(true);
      expect((normalizeAssistantResponse(input2) as Record<string, unknown>).isNonOperational).toBe(true);
    });

    it('should coerce string false/FALSE to boolean false', () => {
      const input1 = { isNonOperational: 'false' };
      const input2 = { isNonOperational: '  FALSE  ' };
      expect((normalizeAssistantResponse(input1) as Record<string, unknown>).isNonOperational).toBe(false);
      expect((normalizeAssistantResponse(input2) as Record<string, unknown>).isNonOperational).toBe(false);
    });

    it('should leave already boolean isNonOperational unchanged', () => {
      const inputTrue = { isNonOperational: true };
      const inputFalse = { isNonOperational: false };
      expect(normalizeAssistantResponse(inputTrue)).toBe(inputTrue);
      expect(normalizeAssistantResponse(inputFalse)).toBe(inputFalse);
    });

    it('should leave invalid isNonOperational strings as-is', () => {
      const input = { isNonOperational: 'unknown-status' };
      const output = normalizeAssistantResponse(input) as Record<string, unknown>;
      expect(output.isNonOperational).toBe('unknown-status');
      expect(output).toBe(input);
    });
  });

  describe('reference equality and general objects', () => {
    it('should return non-object inputs as-is', () => {
      expect(normalizeAssistantResponse(null)).toBe(null);
      expect(normalizeAssistantResponse(undefined)).toBe(undefined);
      expect(normalizeAssistantResponse('string')).toBe('string');
      expect(normalizeAssistantResponse(123)).toBe(123);
    });

    it('should return same object reference if no coercion was applied', () => {
      const input = { normalField: 'value', nested: { field: 1 } };
      const output = normalizeAssistantResponse(input);
      expect(output).toBe(input);
    });

    it('should create a new object only if at least one coercion occurred', () => {
      const input = { confidence: '90%', untouchedField: 'value' };
      const output = normalizeAssistantResponse(input) as Record<string, unknown>;
      expect(output).not.toBe(input);
      expect(output.confidence).toBe(90);
      expect(output.untouchedField).toBe('value');
    });
  });
});
