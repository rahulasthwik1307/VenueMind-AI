import type { AssistantQuery, AssistantServiceResult } from '@/types/assistant';
import { logger } from '@/lib/logger';

const ASSISTANT_API_ENDPOINT = '/api/assistant';
const REQUEST_TIMEOUT_MS = 15_000; // 15-second timeout

/**
 * Real AI assistant service.
 *
 * Client never calls Groq directly. All calls route through /api/assistant
 * which holds the API key server-side and validates every response.
 *
 * Returns a typed AssistantServiceResult — never throws.
 * Error types: network | validation | timeout | rate_limit | unauthorized | unknown
 *
 * See ARCHITECTURE.md — Service Layer, Error Handling
 */
export const assistantService = {
  query: async (query: AssistantQuery): Promise<AssistantServiceResult> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(ASSISTANT_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle known HTTP error codes with typed error responses
      if (response.status === 429) {
        return {
          success: false,
          error: {
            type: 'rate_limit',
            message: 'Too many requests. Please wait a moment before trying again.',
          },
        };
      }

      if (response.status === 401 || response.status === 403) {
        logger.warn('[assistantService] Unauthorized response from API route');
        return {
          success: false,
          error: {
            type: 'unauthorized',
            message: 'Authorization failed. Contact your system administrator.',
          },
        };
      }

      if (!response.ok && response.status !== 502) {
        logger.warn('[assistantService] Non-OK response', { status: response.status });
        return {
          success: false,
          error: {
            type: 'network',
            message: 'The AI service returned an unexpected response. Please try again.',
          },
        };
      }

      // Parse and type-check the response body
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        logger.error('[assistantService] Failed to parse response JSON');
        return {
          success: false,
          error: {
            type: 'validation',
            message: 'The AI service returned an unreadable response. Please try again.',
          },
        };
      }

      // The API route already validates with Zod — we trust its success/error shape
      const typed = body as { success: boolean; data?: unknown; error?: { type: string; message: string } };

      if (typed.success && typed.data) {
        return {
          success: true,
          data: typed.data as import('@/types/assistant').AIStructuredResponse,
        };
      }

      const errType = (typed.error?.type as import('@/types/assistant').AssistantErrorType) ?? 'unknown';
      return {
        success: false,
        error: {
          type: errType,
          message: typed.error?.message ?? 'An unknown error occurred.',
        },
      };
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof DOMException && err.name === 'AbortError') {
        logger.warn('[assistantService] Request timed out after', REQUEST_TIMEOUT_MS, 'ms');
        return {
          success: false,
          error: {
            type: 'timeout',
            message: 'The request timed out. The AI service may be under load — please try again.',
          },
        };
      }

      logger.error('[assistantService] Network error', err);
      return {
        success: false,
        error: {
          type: 'network',
          message: 'Unable to reach the AI service. Check your connection and try again.',
        },
      };
    }
  },
};
