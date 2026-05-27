import { z } from 'zod';

import { ValidationLimits } from '@lib/constants/validation.js';
import { idParamSchema } from '@lib/validations/params/id.param.js';
import { baseSortSchema } from '@lib/validations/queries/sort.query.js';
import { AmenityScope } from '@models/amenities/amenity.model.js';
import {
  AmenityCategorySortFields,
  AmenitySortFields,
} from '@modules/amenities/amenity.constants.js';
import { sanitizeText } from '@utils/sanitizer.js';

// --- AMENITY SHARED SCHEMAS ---

export const amenityIdParamSchema = idParamSchema.clone();
export const amenityCategoryIdParamSchema = idParamSchema.clone();

// --- AMENITY PUBLIC SCHEMAS (Search) ---

export const getAmenitiesQuerySchema = baseSortSchema.extend({
  scope: z.enum(AmenityScope, { message: 'Invalid amenity scope' }).optional(),
  orderBy: z
    .enum(AmenitySortFields, {
      message: 'Invalid orderBy field for amenities',
    })
    .default('categoryId'),
});

export const getAmenityCategoriesQuerySchema = baseSortSchema.extend({
  orderBy: z
    .enum(AmenityCategorySortFields, {
      message: 'Invalid orderBy field for amenity categories',
    })
    .default('order'),
});

// --- AMENITY ADMIN SCHEMAS ---

export const createAmenityBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(ValidationLimits.AMENITY.NAME_MIN)
      .max(ValidationLimits.AMENITY.NAME_MAX)
      .transform((val) => sanitizeText(val)),

    scope: z
      .enum(AmenityScope, { message: 'Invalid amenity scope' })
      .default(AmenityScope.PROPERTY),

    categoryId: z.number().int().positive().nullable().default(null),

    iconKey: z
      .string()
      .trim()
      .max(ValidationLimits.AMENITY.ICON_MAX)
      .transform((val) => sanitizeText(val))
      .nullable()
      .default(null),
  })
  .strict();

export const updateAmenityBodySchema = createAmenityBodySchema.partial().strict();

// --- AMENITY CATEGORY ADMIN SCHEMAS ---

export const createAmenityCategoryBodySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(ValidationLimits.AMENITY.NAME_MIN)
      .max(ValidationLimits.AMENITY.NAME_MAX)
      .transform((val) => sanitizeText(val)),

    description: z
      .string()
      .trim()
      .max(ValidationLimits.AMENITY.DESC_MAX)
      .transform((val) => sanitizeText(val))
      .nullable()
      .default(null),

    order: z.number().int().nonnegative().default(0),
  })
  .strict();

export const updateAmenityCategoryBodySchema = createAmenityCategoryBodySchema.partial().strict();

// --- EXPORT TYPES ---

export type AmenityIdParamDto = z.infer<typeof amenityIdParamSchema>;
export type AmenityCategoryIdParamDto = z.infer<typeof amenityCategoryIdParamSchema>;

export type GetAmenitiesQueryDto = z.infer<typeof getAmenitiesQuerySchema>;
export type GetAmenityCategoriesQueryDto = z.infer<typeof getAmenityCategoriesQuerySchema>;

export type CreateAmenityBodyDto = z.infer<typeof createAmenityBodySchema>;
export type UpdateAmenityBodyDto = z.infer<typeof updateAmenityBodySchema>;

export type CreateAmenityCategoryBodyDto = z.infer<typeof createAmenityCategoryBodySchema>;
export type UpdateAmenityCategoryBodyDto = z.infer<typeof updateAmenityCategoryBodySchema>;
