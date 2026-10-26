import dayjs from 'dayjs';
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
import {
  type StayDateRangeFields,
  isoDateStringSchema,
  validateStayDateRange,
} from '@routes/bookings/booking.validation.js';
import { sanitizeText } from '@utils/sanitizer.js';

// --- VALIDATION HELPERS ---

/**
 * Validates that property search date filters include both boundaries and a valid stay range.
 *
 * @param data - The check-in and check-out date filter fields.
 * @param ctx - The Zod refinement context.
 */
function refinePropertySearchDates(data: StayDateRangeFields, ctx: z.RefinementCtx): void {
  if (data.checkInDate && !data.checkOutDate) {
    ctx.addIssue({
      code: 'custom',
      message: 'checkOutDate is required when checkInDate is provided',
      path: ['checkOutDate'],
    });
    return;
  }

  if (!data.checkInDate && data.checkOutDate) {
    ctx.addIssue({
      code: 'custom',
      message: 'checkInDate is required when checkOutDate is provided',
      path: ['checkInDate'],
    });
    return;
  }

  if (data.checkInDate && data.checkOutDate) {
    validateStayDateRange({ data, ctx });
  }
}

// --- PROPERTY SHARED SCHEMAS ---

export const propertyIdParamSchema = idParamSchema.clone();

export const propertyImageIdParamSchema = z
  .object({
    id: idSchema,
    imageId: idSchema,
  })
  .strict();

export const propertyBlockedDateIdParamSchema = z
  .object({
    id: idSchema,
    blockId: idSchema,
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
      data.bedrooms > ValidationLimits.PROPERTY.SHARED_ROOM_MAX_BEDROOMS
    ) {
      ctx.addIssue({
        code: 'custom',
        message: `A shared room cannot have more than ${ValidationLimits.PROPERTY.SHARED_ROOM_MAX_BEDROOMS} bedroom`,
        path: ['bedrooms'],
      });
    }

    if (data.maxGuests !== undefined && data.beds !== undefined && data.beds > 0) {
      if (data.maxGuests > data.beds * ValidationLimits.PROPERTY.MAX_GUESTS_PER_BED_RATIO) {
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

export const publishPropertyBodySchema = z
  .object({
    autoActivateOnApproval: z
      .boolean({ message: 'autoActivateOnApproval must be a boolean' })
      .default(true),
  })
  .strict();

export const createPropertyBlockedDateBodySchema = z
  .object({
    startDate: isoDateStringSchema,
    endDate: isoDateStringSchema,
    reason: z
      .string()
      .trim()
      .min(1)
      .max(ValidationLimits.BOOKING.BLOCK_REASON_MAX)
      .transform((val) => sanitizeText(val))
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    const start = dayjs(data.startDate).startOf('day');
    const end = dayjs(data.endDate).startOf('day');
    const today = dayjs().startOf('day');

    if (start.isBefore(today)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Start date cannot be in the past',
        path: ['startDate'],
      });
    }

    if (end.isSame(start) || end.isBefore(start)) {
      ctx.addIssue({
        code: 'custom',
        message: 'End date must be after start date',
        path: ['endDate'],
      });
    }

    if (end.diff(today, 'day') > ValidationLimits.BOOKING.MAX_ADVANCE_DAYS) {
      ctx.addIssue({
        code: 'custom',
        message: `Cannot block dates more than ${ValidationLimits.BOOKING.MAX_ADVANCE_DAYS} days in advance`,
        path: ['endDate'],
      });
    }
  });

// --- PROPERTY PUBLIC SCHEMAS (Search, Availability & Quote) ---

export const getPropertyAvailabilityQuerySchema = z
  .object({
    from: isoDateStringSchema.optional(),
    to: isoDateStringSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.from && data.to) {
      const from = dayjs(data.from).startOf('day');
      const to = dayjs(data.to).startOf('day');

      if (to.isSame(from) || to.isBefore(from)) {
        ctx.addIssue({
          code: 'custom',
          message: "'to' date must be after 'from' date",
          path: ['to'],
        });
      }

      if (to.diff(from, 'day') > ValidationLimits.BOOKING.MAX_ADVANCE_DAYS) {
        ctx.addIssue({
          code: 'custom',
          message: `Date range cannot exceed ${ValidationLimits.BOOKING.MAX_ADVANCE_DAYS} days`,
          path: ['to'],
        });
      }
    }
  });

export const getPropertyQuoteQuerySchema = z
  .object({
    checkInDate: isoDateStringSchema,
    checkOutDate: isoDateStringSchema,
    guestsCount: z.coerce
      .number()
      .int()
      .positive()
      .max(ValidationLimits.PROPERTY.MAX_GUESTS)
      .default(1),
  })
  .superRefine((data, ctx) => validateStayDateRange({ data, ctx }));

const baseGetPropertiesQuerySchema = basePaginationSchema.extend({
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

  checkInDate: isoDateStringSchema.optional(),
  checkOutDate: isoDateStringSchema.optional(),

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

export const getPropertiesQuerySchema = baseGetPropertiesQuerySchema.superRefine((data, ctx) =>
  refinePropertySearchDates(data, ctx),
);

// --- PROPERTY ADMIN SCHEMAS ---

export const adminGetPropertiesQuerySchema = baseGetPropertiesQuerySchema
  .extend({
    status: z.enum(PropertyStatus, { message: 'Invalid property status' }).optional(),
    hostId: z.coerce.number().int().positive().optional(),
    licenseNumber: z.string().trim().max(ValidationLimits.PROPERTY.LICENSE_MAX).optional(),
    includeDeleted: z.coerce
      .boolean({ message: 'includeDeleted must be a boolean' })
      .default(false),
  })
  .superRefine((data, ctx) => refinePropertySearchDates(data, ctx));

export const adminUpdatePropertyBodySchema = updatePropertyBodySchema
  .extend({
    status: z.enum(PropertyStatus, { message: 'Invalid property status' }).optional(),
  })
  .strict();

export const adminRejectPropertyBodySchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(ValidationLimits.PROPERTY.REJECTION_REASON_MIN)
      .max(ValidationLimits.PROPERTY.REJECTION_REASON_MAX)
      .transform((val) => sanitizeText(val)),
  })
  .strict();

// --- EXPORT TYPES ---

export type PropertyIdParamDto = z.infer<typeof propertyIdParamSchema>;
export type PropertyImageIdParamDto = z.infer<typeof propertyImageIdParamSchema>;
export type PropertyBlockedDateIdParamDto = z.infer<typeof propertyBlockedDateIdParamSchema>;

export type CreatePropertyBodyDto = z.infer<typeof createPropertyBodySchema>;
export type UpdatePropertyBodyDto = z.infer<typeof updatePropertyBodySchema>;
export type ReorderPropertyImagesBodyDto = z.infer<typeof reorderPropertyImagesBodySchema>;
export type PublishPropertyBodyDto = z.infer<typeof publishPropertyBodySchema>;
export type CreatePropertyBlockedDateBodyDto = z.infer<typeof createPropertyBlockedDateBodySchema>;

export type GetPropertiesQueryDto = z.infer<typeof getPropertiesQuerySchema>;
export type GetPropertyAvailabilityQueryDto = z.infer<typeof getPropertyAvailabilityQuerySchema>;
export type GetPropertyQuoteQueryDto = z.infer<typeof getPropertyQuoteQuerySchema>;

export type AdminGetPropertiesQueryDto = z.infer<typeof adminGetPropertiesQuerySchema>;
export type AdminUpdatePropertyBodyDto = z.infer<typeof adminUpdatePropertyBodySchema>;
export type AdminRejectPropertyBodyDto = z.infer<typeof adminRejectPropertyBodySchema>;
