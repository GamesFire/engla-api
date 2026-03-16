import { z } from 'zod';

import { avatarSchema, emailSchema, nameSchema } from '@lib/validations/user-shared.validation.js';

export const loginBodySchema = z
  .object({
    email: emailSchema,
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    avatarUrl: avatarSchema.optional(),
  })
  .strict();

export type LoginBodyDto = z.infer<typeof loginBodySchema>;
