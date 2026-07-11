import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { serverEnv } from '@/lib/env';
import { getSystemPrompt } from '@/prompts/system';
import { getOperationsPersonaPrompt } from '@/prompts/personas';
import { buildUserPrompt } from '@/prompts/templates';
import { aiStructuredResponseSchema, assistantRequestSchema } from '@/schemas/assistant.schema';
import { logger } from '@/lib/logger';
import type { AssistantLanguage } from '@/types/assistant';

/**
 * Normalizes specific, confirmed type mismatches in the AI response before Zod parsing.
 * - Coerces confidence from string ("92" / "92%") to number.
 * - Coerces isNonOperational from string ("true" / "false") to boolean.
 */
export function normalizeAssistantResponse(raw: unknown): unknown {
  if (typeof raw !== 'object' || raw === null) {
    return raw;
  }

  let coerced: Record<string, unknown> | null = null;

  // 1. Coerce confidence
  if ('confidence' in raw) {
    const rawConf = (raw as Record<string, unknown>).confidence;
    if (typeof rawConf === 'string') {
      const stripped = rawConf.replace(/%/g, '').trim();
      const parsed = Number(stripped);
      if (!isNaN(parsed) && stripped !== '') {
        coerced = coerced || { ...(raw as Record<string, unknown>) };
        coerced.confidence = parsed;
        logger.debug('[assistant/route] Coerced confidence from string to number', { original: rawConf, coerced: parsed });
      }
    }
  }

  // 2. Coerce isNonOperational
  if ('isNonOperational' in raw) {
    const rawVal = (raw as Record<string, unknown>).isNonOperational;
    if (typeof rawVal === 'string') {
      const normalizedStr = rawVal.trim().toLowerCase();
      if (normalizedStr === 'true') {
        coerced = coerced || { ...(raw as Record<string, unknown>) };
        coerced.isNonOperational = true;
        logger.debug('[assistant/route] Coerced isNonOperational from string to boolean', { original: rawVal, coerced: true });
      } else if (normalizedStr === 'false') {
        coerced = coerced || { ...(raw as Record<string, unknown>) };
        coerced.isNonOperational = false;
        logger.debug('[assistant/route] Coerced isNonOperational from string to boolean', { original: rawVal, coerced: false });
      }
    }
  }

  return coerced || raw;
}

// ─── Rate Limiter ─────────────────────────────────────────────────────────────

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1-minute sliding window
const RATE_LIMIT_MAX_REQUESTS = 12;  // per IP per minute

/**
 * Simple in-memory sliding-window rate limiter.
 * Keyed by client IP. Appropriate for single-instance hackathon deployment.
 * Returns true if the request is allowed, false if it should be rejected.
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

// ─── Groq Client ──────────────────────────────────────────────────────────────

// Instantiated once per serverless invocation — groq-sdk handles connection pooling
const groq = new Groq({ apiKey: serverEnv.GROQ_API_KEY });

// ─── Groq Call ────────────────────────────────────────────────────────────────

async function callGroq(systemPrompt: string, userPrompt: string): Promise<unknown> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.25,
    max_tokens: 1200,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Groq returned an empty response content');
  }

  return JSON.parse(content) as unknown;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous';

  if (!checkRateLimit(ip)) {
    logger.warn('[assistant/route] Rate limit exceeded', { ip });
    return NextResponse.json(
      {
        success: false,
        error: {
          type: 'rate_limit',
          message: 'Too many requests. Please wait before submitting another query.',
        },
      },
      { status: 429 }
    );
  }

  // ── Parse & validate request body ─────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { type: 'validation', message: 'Invalid request body — expected JSON.' },
      },
      { status: 400 }
    );
  }

  const requestValidation = assistantRequestSchema.safeParse(body);
  if (!requestValidation.success) {
    logger.warn('[assistant/route] Request validation failed', requestValidation.error.issues);
    return NextResponse.json(
      {
        success: false,
        error: { type: 'validation', message: 'Request format is invalid.' },
      },
      { status: 400 }
    );
  }

  const { query, context, persona, language } = requestValidation.data;

  // ── Guard: API key must be configured ────────────────────────────────────
  if (!serverEnv.GROQ_API_KEY) {
    logger.error('[assistant/route] GROQ_API_KEY is not configured');
    return NextResponse.json(
      {
        success: false,
        error: {
          type: 'unknown',
          message: 'AI service is not configured. Contact your system administrator.',
        },
      },
      { status: 503 }
    );
  }

  // ── Build prompts (server-side only) ──────────────────────────────────────
  const systemPrompt = getSystemPrompt(language as AssistantLanguage);
  const personaPrompt = getOperationsPersonaPrompt();
  const fullSystemPrompt = `${systemPrompt}\n\n${personaPrompt}`;

  const userPrompt = buildUserPrompt({
    query,
    context: {
      mode: context.mode,
      incidentId: context.incidentId,
      incidentIds: context.incidentIds,
      incidentData: context.incidentData,
      incidentsData: context.incidentsData,
      zoneId: context.zoneId,
      domain: context.domain as import('@/types/assistant').AssistantDomain | undefined,
      conversationHistory: context.conversationHistory,
    },
    persona,
  });

  // ── First Groq attempt ────────────────────────────────────────────────────
  let rawResponse: unknown;
  try {
    rawResponse = await callGroq(fullSystemPrompt, userPrompt);
  } catch (err) {
    logger.error('[assistant/route] Groq first call failed', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          type: 'network',
          message: 'The AI service is temporarily unavailable. Please try again shortly.',
        },
      },
      { status: 503 }
    );
  }

  // ── Validate first response ───────────────────────────────────────────────
  const normalizedFirst = normalizeAssistantResponse(rawResponse);
  const firstParsed = aiStructuredResponseSchema.safeParse(normalizedFirst);
  if (firstParsed.success) {
    const wasNormalized = normalizedFirst !== rawResponse;
    logger.info(
      `[assistant/route] Response validated successfully on first attempt${wasNormalized ? ' (with normalization)' : ''}`
    );
    return NextResponse.json({ success: true, data: firstParsed.data });
  }

  logger.warn(
    '[assistant/route] First response failed schema validation — retrying once',
    firstParsed.error.issues
  );

  // ── Single retry on validation failure ────────────────────────────────────
  let retryResponse: unknown;
  try {
    retryResponse = await callGroq(fullSystemPrompt, userPrompt);
  } catch (err) {
    logger.error('[assistant/route] Groq retry call also failed', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          type: 'validation',
          message: 'AI returned malformed data. Please try again.',
        },
      },
      { status: 502 }
    );
  }

  const normalizedRetry = normalizeAssistantResponse(retryResponse);
  const retryParsed = aiStructuredResponseSchema.safeParse(normalizedRetry);
  if (retryParsed.success) {
    const wasNormalized = normalizedRetry !== retryResponse;
    logger.info(
      `[assistant/route] Response validated successfully on retry${wasNormalized ? ' (with normalization)' : ''}`
    );
    return NextResponse.json({ success: true, data: retryParsed.data });
  }

  // ── Both attempts failed validation ──────────────────────────────────────
  logger.error(
    '[assistant/route] Retry response also failed schema validation — returning typed error',
    retryParsed.error.issues
  );

  return NextResponse.json(
    {
      success: false,
      error: {
        type: 'validation',
        message: 'The AI returned an unexpected response format. Please try again.',
      },
    },
    { status: 502 }
  );
}
