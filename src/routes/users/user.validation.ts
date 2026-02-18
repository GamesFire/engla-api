import { z } from 'zod';

import { ValidationLimits } from '@lib/constants/validation.js';
import { idParamSchema } from '@lib/validations/params/id.param.js';
import { basePaginationSchema } from '@lib/validations/queries/pagination.query.js';
import { avatarSchema, nameSchema } from '@lib/validations/user-shared.validation.js';
import { Locale, UserRole } from '@models/users/user.model.js';

// --- USER PROTECTED SCHEMAS ---

export const updateUserBodySchema = z
  .object({
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    avatarUrl: avatarSchema.optional(),

    phone: z
      .string()
      .trim()
      .max(ValidationLimits.PHONE_MAX, {
        message: 'Phone number is too long',
      })
      .optional(),

    language: z
      .enum(Locale, {
        message: 'Invalid language locale',
      })
      .optional(),

    currency: z
      .string()
      .trim()
      .length(3, {
        message: 'Currency must be a 3-letter code (e.g. USD)',
      })
      .toUpperCase()
      .regex(/^[A-Z]{3}$/, {
        message: 'Currency must contain only uppercase letters',
      })
      .optional(),
  })
  .strict();

// --- USER ADMIN SCHEMAS ---

export const userIdParamSchema = idParamSchema.clone();

export const getAllUsersQuerySchema = basePaginationSchema.extend({
  orderBy: z
    .enum(['createdAt', 'email', 'firstName', 'lastName', 'role'] as const, {
      message: 'Invalid orderBy field for users',
    })
    .default('createdAt'),

  includeDeleted: z.coerce.boolean().default(false),

  search: z.string().trim().min(1).max(100).optional(),

  role: z.enum(UserRole).optional(),

  isVerified: z.coerce.boolean().optional(),

  createdFrom: z.coerce.date().optional(),

  createdTo: z.coerce.date().optional(),
});

export const adminUpdateUserBodySchema = updateUserBodySchema
  .extend({
    role: z
      .enum(UserRole, {
        message: 'Invalid user role',
      })
      .optional(),

    isVerified: z
      .boolean({
        message: 'isVerified must be a boolean',
      })
      .optional(),

    stripeOnboardingCompleted: z
      .boolean({
        message: 'stripeOnboardingCompleted must be a boolean',
      })
      .optional(),
  })
  .strict();

export type UpdateUserBodyDto = z.infer<typeof updateUserBodySchema>;
export type UserIdParamDto = z.infer<typeof userIdParamSchema>;
export type GetAllUsersQueryDto = z.infer<typeof getAllUsersQuerySchema>;
export type AdminUpdateUserBodyDto = z.infer<typeof adminUpdateUserBodySchema>;
