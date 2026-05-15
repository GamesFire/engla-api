import { z } from 'zod';

/**
 * Custom Zod schema to safely parse boolean environment variables.
 * This preprocessor explicitly checks for "true" or "1", and ignores whitespace.
 * * Reason: Native `z.coerce.boolean()` evaluates the string "false" as true.
 */
export const envBooleanSchema = z.preprocess((value: unknown) => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1';
  }

  return value;
}, z.boolean());
