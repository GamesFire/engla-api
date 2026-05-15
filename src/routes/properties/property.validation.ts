import { z } from 'zod';

import { EnglandCounties } from '@lib/constants/geography.js';
import { ValidationLimits, ValidationPatterns } from '@lib/constants/validation.js';
import { idParamSchema, idSchema } from '@lib/validations/params/id.param.js';
import { basePaginationSchema } from '@lib/validations/queries/pagination.query.js';
import {
  CancellationPolicy,
  PropertyStatus,
  PropertyType,
  RoomType,
} from '@models/properties/property.model.js';
import { PropertySortFields } from '@modules/properties/property.constants.js';
import { sanitizeText } from '@utils/sanitizer.js';

// --- PROPERTY SHARED SCHEMAS ---

export const propertyIdParamSchema = idParamSchema.clone();

export const propertyImageIdParamSchema = z
  .object({
    id: idSchema,
    imageId: idSchema,
  })
  .strict();

export const basePropertyFieldsSchema = z
  .object({
    propertyType: z.enum(PropertyType, { message: 'Invalid property type' }),
    roomType: z.enum(RoomType, { message: 'Invalid room type' }),

    title: z
      .string()
      .trim()
      .min(ValidationLimits.PROPERTY.TITLE_MIN)
      .max(ValidationLimits.PROPERTY.TITLE_MAX)
      .transform((val) => sanitizeText(val)),

    description: z
      .string()
      .trim()
      .min(ValidationLimits.PROPERTY.DESC_MIN)
      .max(ValidationLimits.PROPERTY.DESC_MAX)
      .transform((val) => sanitizeText(val)),

    addressLine1: z
      .string()
      .trim()
      .min(ValidationLimits.PROPERTY.ADDRESS_MIN)
      .max(ValidationLimits.PROPERTY.ADDRESS_MAX)
      .transform((val) => sanitizeText(val)),

    addressLine2: z
      .string()
      .trim()
      .min(1)
      .max(ValidationLimits.PROPERTY.ADDRESS_MAX)
      .transform((val) => sanitizeText(val))
      .optional(),

    city: z
      .string()
      .trim()
      .min(ValidationLimits.PROPERTY.CITY_MIN)
      .max(ValidationLimits.PROPERTY.CITY_MAX)
      .regex(ValidationPatterns.CITY, { message: 'City name contains invalid characters' }),

    county: z.enum(EnglandCounties, { message: 'Invalid county' }),

    postcode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(ValidationPatterns.UK_POSTCODE, { message: 'Invalid Postcode format' }),

    latitude: z
      .number()
      .min(ValidationLimits.GEOGRAPHY.ENGLAND_LAT_MIN)
      .max(ValidationLimits.GEOGRAPHY.ENGLAND_LAT_MAX)
      .optional(),

    longitude: z
      .number()
      .min(ValidationLimits.GEOGRAPHY.ENGLAND_LNG_MIN)
      .max(ValidationLimits.GEOGRAPHY.ENGLAND_LNG_MAX)
      .optional(),

    maxGuests: z.number().int().positive().max(ValidationLimits.PROPERTY.MAX_GUESTS),
    bedrooms: z.number().int().nonnegative().max(ValidationLimits.PROPERTY.MAX_ROOMS),
    beds: z.number().int().nonnegative().max(ValidationLimits.PROPERTY.MAX_ROOMS),
    bathrooms: z.number().int().nonnegative().max(ValidationLimits.PROPERTY.MAX_ROOMS),
    areaSqM: z.number().positive().max(ValidationLimits.PROPERTY.MAX_AREA_SQM).optional(),

    checkInTime: z
      .string()
      .regex(ValidationPatterns.TIME_HH_MM, { message: 'Invalid time format (HH:MM)' }),

    checkOutTime: z
      .string()
      .regex(ValidationPatterns.TIME_HH_MM, { message: 'Invalid time format (HH:MM)' }),

    isPetsAllowed: z.boolean({ message: 'isPetsAllowed must be a boolean' }).default(false),

    houseRules: z
      .string()
      .trim()
      .max(ValidationLimits.PROPERTY.RULES_MAX, {
        message: `House rules cannot exceed ${ValidationLimits.PROPERTY.RULES_MAX} characters (including formatting)`,
      })
      .transform((val) => sanitizeText(val))
      .optional(),

    cancellationPolicy: z.enum(CancellationPolicy, { message: 'Invalid cancellation policy' }),
    pricePerNight: z.number().int().positive().max(ValidationLimits.PROPERTY.MAX_PRICE_PENCE),

    cleaningFee: z
      .number()
      .int()
      .nonnegative()
      .max(ValidationLimits.PROPERTY.MAX_CLEANING_FEE_PENCE)
      .default(0),

    licenseNumber: z
      .string()
      .trim()
      .max(ValidationLimits.PROPERTY.LICENSE_MAX)
      .transform((val) => sanitizeText(val))
      .optional(),

    amenityIds: z
      .array(z.number().int().positive())
      .max(ValidationLimits.PROPERTY.MAX_AMENITIES)
      .optional(),
  })
  .strict();

// --- PROPERTY PROTECTED SCHEMAS (For Hosts) ---

export const createPropertyBodySchema = z
  .object({
    propertyType: z.enum(PropertyType, { message: 'Invalid property type' }),
  })
  .strict();

export const updatePropertyBodySchema = basePropertyFieldsSchema
  .partial()
  .strict()
  .superRefine((data, ctx) => {
    if (data.propertyType === PropertyType.HOTEL && !data.licenseNumber) {
      ctx.addIssue({
        code: 'custom',
        message: 'Hotels must provide a valid business license number',
        path: ['licenseNumber'],
      });
    }

    if (
      data.roomType === RoomType.SHARED_ROOM &&
      data.bedrooms !== undefined &&
      data.bedrooms > 1
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'A shared room cannot have more than 1 bedroom',
        path: ['bedrooms'],
      });
    }

    if (data.maxGuests !== undefined && data.beds !== undefined && data.beds > 0) {
      if (data.maxGuests > data.beds * 3) {
        ctx.addIssue({
          code: 'custom',
          message: 'The maximum number of guests exceeds a reasonable capacity for the given beds',
          path: ['maxGuests'],
        });
      }
    }

    if (data.checkInTime && data.checkOutTime) {
      const inHourStr = data.checkInTime.split(':')[0];
      const outHourStr = data.checkOutTime.split(':')[0];

      if (inHourStr && outHourStr) {
        const checkInHour = parseInt(inHourStr, 10);
        const checkOutHour = parseInt(outHourStr, 10);

        if (checkOutHour >= checkInHour) {
          ctx.addIssue({
            code: 'custom',
            message: 'Check-out time must be before check-in time',
            path: ['checkOutTime'],
          });
        }
      }
    }
  });

export const reorderPropertyImagesBodySchema = z
  .object({
    imageIds: z.array(idSchema).min(1).max(ValidationLimits.PROPERTY.MAX_IMAGES),
  })
  .strict();

// --- PROPERTY PUBLIC SCHEMAS (Search) ---

export const getAllPropertiesQuerySchema = basePaginationSchema.extend({
  orderBy: z
    .enum(PropertySortFields, {
      message: 'Invalid orderBy field for properties',
    })
    .default('createdAt'),

  city: z
    .string()
    .trim()
    .min(ValidationLimits.PROPERTY.CITY_MIN)
    .max(ValidationLimits.PROPERTY.CITY_MAX)
    .optional(),

  county: z.enum(EnglandCounties, { message: 'Invalid county' }).optional(),
  propertyType: z.enum(PropertyType, { message: 'Invalid property type' }).optional(),
  roomType: z.enum(RoomType, { message: 'Invalid room type' }).optional(),

  cancellationPolicy: z
    .enum(CancellationPolicy, { message: 'Invalid cancellation policy' })
    .optional(),

  minPrice: z.coerce.number().int().nonnegative().optional(),

  maxPrice: z.coerce
    .number()
    .int()
    .positive()
    .max(ValidationLimits.PROPERTY.MAX_PRICE_PENCE)
    .optional(),

  minGuests: z.coerce
    .number()
    .int()
    .positive()
    .max(ValidationLimits.PROPERTY.MAX_GUESTS)
    .optional(),

  minBedrooms: z.coerce
    .number()
    .int()
    .positive()
    .max(ValidationLimits.PROPERTY.MAX_ROOMS)
    .optional(),

  minBeds: z.coerce.number().int().positive().max(ValidationLimits.PROPERTY.MAX_ROOMS).optional(),

  minBathrooms: z.coerce
    .number()
    .int()
    .positive()
    .max(ValidationLimits.PROPERTY.MAX_ROOMS)
    .optional(),

  isPetsAllowed: z.coerce.boolean({ message: 'isPetsAllowed must be a boolean' }).optional(),

  amenityIds: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val, ctx) => {
      if (!val) return undefined;

      const arr = Array.isArray(val) ? val : val.split(',');
      const result: number[] = [];

      for (const id of arr) {
        const trimmed = id.trim();

        if (trimmed === '') {
          continue;
        }

        if (!ValidationPatterns.NUMERIC_STRING.test(trimmed)) {
          ctx.addIssue({
            code: 'custom',
            message: `Invalid amenity ID format: '${trimmed}'`,
          });
          return z.NEVER;
        }

        const parsed = parseInt(trimmed, 10);

        if (parsed <= 0) {
          ctx.addIssue({
            code: 'custom',
            message: `Amenity ID must be a positive number: ${parsed}`,
          });
          return z.NEVER;
        }

        result.push(parsed);
      }

      return result.length > 0 ? result : undefined;
    }),
});

// --- PROPERTY ADMIN SCHEMAS ---

export const adminGetAllPropertiesQuerySchema = getAllPropertiesQuerySchema.extend({
  status: z.enum(PropertyStatus, { message: 'Invalid property status' }).optional(),
  hostId: z.coerce.number().int().positive().optional(),
  licenseNumber: z.string().trim().max(ValidationLimits.PROPERTY.LICENSE_MAX).optional(),
  includeDeleted: z.coerce.boolean({ message: 'includeDeleted must be a boolean' }).default(false),
});

export const adminUpdatePropertyBodySchema = updatePropertyBodySchema
  .extend({
    status: z.enum(PropertyStatus, { message: 'Invalid property status' }).optional(),
  })
  .strict();

// --- EXPORT TYPES ---

export type PropertyIdParamDto = z.infer<typeof propertyIdParamSchema>;
export type PropertyImageIdParamDto = z.infer<typeof propertyImageIdParamSchema>;

export type CreatePropertyBodyDto = z.infer<typeof createPropertyBodySchema>;
export type UpdatePropertyBodyDto = z.infer<typeof updatePropertyBodySchema>;
export type ReorderPropertyImagesBodyDto = z.infer<typeof reorderPropertyImagesBodySchema>;

export type GetAllPropertiesQueryDto = z.infer<typeof getAllPropertiesQuerySchema>;

export type AdminGetAllPropertiesQueryDto = z.infer<typeof adminGetAllPropertiesQuerySchema>;
export type AdminUpdatePropertyBodyDto = z.infer<typeof adminUpdatePropertyBodySchema>;
