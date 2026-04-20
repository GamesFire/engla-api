import { z } from 'zod';

import { ValidationLimits, ValidationPatterns } from '@lib/constants/validation.js';
import { idParamSchema } from '@lib/validations/params/id.param.js';
import { basePaginationSchema } from '@lib/validations/queries/pagination.query.js';
import { avatarSchema, nameSchema } from '@lib/validations/user-shared.validation.js';
import { Locale, UserRole } from '@models/users/user.model.js';

// --- USER SHARED SCHEMAS ---

export const userIdParamSchema = idParamSchema.clone();

// --- USER PROTECTED SCHEMAS ---

export const updateUserBodySchema = z
  .object({
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),
    avatarUrl: avatarSchema.optional(),

    phone: z
      .string()
      .trim()
      .max(ValidationLimits.USER.PHONE_MAX, { message: 'Phone number is too long' })
      .regex(ValidationPatterns.PHONE_E164, {
        message: 'Phone must be in E.164 format (e.g., +447123456789)',
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
      .length(3, { message: 'Currency must be a 3-letter code (e.g. GBP)' })
      .toUpperCase()
      .regex(ValidationPatterns.CURRENCY_CODE, {
        message: 'Currency must contain only uppercase letters',
      })
      .optional(),
  })
  .strict();

// --- USER ADMIN SCHEMAS ---

export const adminGetAllUsersQuerySchema = basePaginationSchema.extend({
  orderBy: z
    .enum(['createdAt', 'email', 'firstName', 'lastName', 'role'] as const, {
      message: 'Invalid orderBy field for users',
    })
    .default('createdAt'),

  includeDeleted: z.coerce.boolean({ message: 'includeDeleted must be a boolean' }).default(false),

  search: z
    .string()
    .trim()
    .min(ValidationLimits.SEARCH.MIN)
    .max(ValidationLimits.SEARCH.MAX)
    .optional(),

  role: z.enum(UserRole, { message: 'Invalid user role' }).optional(),
  isVerified: z.coerce.boolean({ message: 'isVerified must be a boolean' }).optional(),
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

export type UserIdParamDto = z.infer<typeof userIdParamSchema>;
export type UpdateUserBodyDto = z.infer<typeof updateUserBodySchema>;
export type AdminGetAllUsersQueryDto = z.infer<typeof adminGetAllUsersQuerySchema>;
export type AdminUpdateUserBodyDto = z.infer<typeof adminUpdateUserBodySchema>;
