import { z } from 'zod';

import { ValidationLimits, ValidationPatterns } from '@lib/constants/validation.js';
import { formatName } from '@utils/format.js';

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, { message: 'Email is required' })
  .max(ValidationLimits.EMAIL_MAX, { message: 'Email is too long' })
  .pipe(z.email({ message: 'Invalid email format' }));

export const nameSchema = z
  .string()
  .trim()
  .min(ValidationLimits.NAME_MIN, { message: 'Name is too short' })
  .max(ValidationLimits.NAME_MAX, { message: 'Name is too long' })
  .regex(ValidationPatterns.NAME, { message: 'Name contains invalid characters' })
  .transform(formatName);

export const avatarSchema = z
  .string()
  .trim()
  .max(ValidationLimits.URL_MAX, { message: 'URL is too long' })
  .startsWith('https://', { message: 'Avatar URL must use secure HTTPS protocol' })
  .pipe(z.url({ message: 'Invalid URL format' }));
