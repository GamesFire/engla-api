import { z } from 'zod';

import { ValidationLimit, ValidationRegex } from '@lib/constants/validation.js';
import { formatName } from '@utils/format.js';

export const loginBodySchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, { message: 'Email is required' })
      .max(ValidationLimit.EMAIL_MAX_LENGTH, { message: 'Email is too long' })
      .pipe(z.email({ message: 'Invalid email format' })),

    firstName: z
      .string()
      .trim()
      .min(ValidationLimit.NAME_MIN_LENGTH, { message: 'First name must be at least 1 character' })
      .max(ValidationLimit.NAME_MAX_LENGTH, { message: 'First name is too long' })
      .regex(ValidationRegex.NAME, { message: 'First name contains invalid characters' })
      .transform(formatName)
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(ValidationLimit.NAME_MIN_LENGTH, { message: 'Last name must be at least 1 character' })
      .max(ValidationLimit.NAME_MAX_LENGTH, { message: 'Last name is too long' })
      .regex(ValidationRegex.NAME, { message: 'Last name contains invalid characters' })
      .transform(formatName)
      .optional(),

    avatarUrl: z
      .string()
      .trim()
      .max(ValidationLimit.URL_MAX_LENGTH, { message: 'URL is too long' })
      .startsWith('https://', { message: 'Avatar URL must use secure HTTPS protocol' })
      .pipe(z.url({ message: 'Invalid URL format' }))
      .optional(),
  })
  .strict();

export type LoginBodyDto = z.infer<typeof loginBodySchema>;
