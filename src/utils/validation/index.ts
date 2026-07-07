import { z } from 'zod';

export const emailSchema = z.string().email();

export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}
