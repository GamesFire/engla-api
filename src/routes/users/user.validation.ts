import { isValidPhoneNumber } from 'libphonenumber-js';
import { z } from 'zod';

import { ValidationLimits, ValidationPatterns } from '@lib/constants/validation.js';
import { idParamSchema } from '@lib/validations/params/id.param.js';
import { basePaginationSchema } from '@lib/validations/queries/pagination.query.js';
import { avatarSchema, nameSchema } from '@lib/validations/user-shared.validation.js';
import { SystemPermission } from '@models/permission.model.js';
import { Locale, UserRole } from '@models/users/user.model.js';
import { UserSortFields } from '@modules/users/user.constants.js';

// --- USER SHARED SCHEMAS ---

export const userIdParamSchema = idParamSchema.clone();

// --- USER PROTECTED SCHEMAS ---

export const updateUserBodySchema = z
  .object({
    firstName: nameSchema.optional(),
    lastName: nameSchema.optional(),

    phone: z
      .string()
      .trim()
      .max(ValidationLimits.USER.PHONE_MAX, { message: 'Phone number is too long' })
      .refine((val) => isValidPhoneNumber(val), {
        message:
          'Invalid phone number format or non-existent region code. Must be a valid E.164 number (e.g., +447123456789)',
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

export const adminGetUsersQuerySchema = basePaginationSchema.extend({
  orderBy: z
    .enum(UserSortFields, {
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
    avatarUrl: avatarSchema.optional(),

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

export const adminSyncPermissionsBodySchema = z
  .object({
    permissions: z
      .array(
        z.enum(SystemPermission, {
          message: 'Invalid permissions for user',
        }),
      )
      .default([]),
  })
  .strict();

// --- EXPORT TYPES ---

export type UserIdParamDto = z.infer<typeof userIdParamSchema>;

export type UpdateUserBodyDto = z.infer<typeof updateUserBodySchema>;

export type AdminGetUsersQueryDto = z.infer<typeof adminGetUsersQuerySchema>;
export type AdminUpdateUserBodyDto = z.infer<typeof adminUpdateUserBodySchema>;
export type AdminSyncPermissionsBodyDto = z.infer<typeof adminSyncPermissionsBodySchema>;
