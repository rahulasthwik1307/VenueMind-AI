import { z } from 'zod';

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
