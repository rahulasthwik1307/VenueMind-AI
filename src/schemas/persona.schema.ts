import { z } from 'zod';

export const userPersonaSchema = z.enum(['fan', 'volunteer', 'operations']);

export const personaMetadataSchema = z.object({
  id: userPersonaSchema,
  name: z.string(),
  description: z.string(),
  allowedFeatures: z.array(z.string()),
});
