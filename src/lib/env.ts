import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional().default('http://localhost:3000/api'),
  NEXT_PUBLIC_GEMINI_API_KEY: z.string().optional(),
});

// Use safeParse to prevent crashing on initialization if variables are missing in build step
const parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

if (!parsed.success) {
  console.warn('⚠️ Environment validation failed:', parsed.error.format());
}

export const env = parsed.success
  ? parsed.data
  : {
      NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
      NEXT_PUBLIC_GEMINI_API_KEY: undefined,
    };
