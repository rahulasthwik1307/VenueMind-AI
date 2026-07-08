import { z } from 'zod';

// ─── Client-side Environment ──────────────────────────────────────────────────
// Only NEXT_PUBLIC_ vars are safe to expose to the browser bundle.

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional().default('http://localhost:3000/api'),
  NEXT_PUBLIC_APP_NAME: z.string().optional().default('VenueMind AI'),
});

const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});

if (!parsed.success) {
  // Warn but do not crash — graceful degradation in build step
  console.warn('⚠️ Client environment validation failed:', parsed.error.format());
}

export const env = parsed.success
  ? parsed.data
  : {
      NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
      NEXT_PUBLIC_APP_NAME: 'VenueMind AI',
    };

// ─── Server-side Environment ──────────────────────────────────────────────────
// These are NEVER bundled to the client. Access only from API routes / server components.
// Groq API key must never appear in any NEXT_PUBLIC_ variable.

export const serverEnv = {
  /** Groq API key — used exclusively in app/api/assistant/route.ts */
  GROQ_API_KEY: process.env.GROQ_API_KEY ?? '',
};
