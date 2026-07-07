import { z } from 'zod';

export const incidentSchema = z.object({
  id: z.string(),
  title: z.string().min(3).max(100),
  description: z.string().min(5),
  status: z.enum(['open', 'investigating', 'resolved']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    zone: z.string(),
  }),
  reporterId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
