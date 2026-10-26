import dayjs from 'dayjs';
import { z } from 'zod';

import { ValidationLimits, ValidationPatterns } from '@lib/constants/validation.js';
import { idParamSchema, idSchema } from '@lib/validations/params/id.param.js';
import { basePaginationSchema } from '@lib/validations/queries/pagination.query.js';
import { BookingStatus, PaymentStatus } from '@models/bookings/booking.model.js';
import { BookingSortFields, BookingTimeFrame } from '@modules/bookings/booking.constants.js';
import { sanitizeText } from '@utils/sanitizer.js';

// --- VALIDATION HELPERS ---

export type StayDateRangeFields = {
  checkInDate?: string;
  checkOutDate?: string;
};

export type ValidateStayDateRangeParams = {
  data: StayDateRangeFields;
  ctx: z.RefinementCtx;
  allowPastCheckIn?: boolean;
};

/**
 * Validates that a check-in and check-out date pair represents a valid future stay duration.
 *
 * @param params - The stay date fields, Zod refinement context, and validation flags.
 */
export function validateStayDateRange(params: ValidateStayDateRangeParams): void {
  const { data, ctx, allowPastCheckIn = false } = params;

  if (!data.checkInDate || !data.checkOutDate) return;

  const checkIn = dayjs(data.checkInDate).startOf('day');
  const checkOut = dayjs(data.checkOutDate).startOf('day');
  const today = dayjs().startOf('day');

  if (!allowPastCheckIn && checkIn.isBefore(today)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Check-in date cannot be in the past',
      path: ['checkInDate'],
    });
  }

  if (!allowPastCheckIn && checkIn.diff(today, 'day') > ValidationLimits.BOOKING.MAX_ADVANCE_DAYS) {
    ctx.addIssue({
      code: 'custom',
      message: `Cannot book more than ${ValidationLimits.BOOKING.MAX_ADVANCE_DAYS} days in advance`,
      path: ['checkInDate'],
    });
  }

  if (checkOut.isSame(checkIn) || checkOut.isBefore(checkIn)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Check-out date must be after check-in date',
      path: ['checkOutDate'],
    });
    return;
  }

  const nights = checkOut.diff(checkIn, 'day');

  if (nights < ValidationLimits.BOOKING.MIN_NIGHTS) {
    ctx.addIssue({
      code: 'custom',
      message: `Minimum stay duration is ${ValidationLimits.BOOKING.MIN_NIGHTS} night(s)`,
      path: ['checkOutDate'],
    });
  }

  if (nights > ValidationLimits.BOOKING.MAX_NIGHTS) {
    ctx.addIssue({
      code: 'custom',
      message: `Maximum stay duration is ${ValidationLimits.BOOKING.MAX_NIGHTS} nights`,
      path: ['checkOutDate'],
    });
  }
}

// --- BOOKING SHARED SCHEMAS ---

export const bookingIdParamSchema = idParamSchema.clone();

export const isoDateStringSchema = z
  .string()
  .trim()
  .regex(ValidationPatterns.DATE_YYYY_MM_DD, {
    message: 'Invalid date format (YYYY-MM-DD)',
  })
  .refine((val) => dayjs(val).format('YYYY-MM-DD') === val, {
    message: 'Invalid calendar date',
  });

// --- BOOKING PROTECTED SCHEMAS (Guests & Hosts) ---

export const getMyBookingsQuerySchema = basePaginationSchema.extend({
  orderBy: z
    .enum(BookingSortFields, {
      message: 'Invalid orderBy field for bookings',
    })
    .default('createdAt'),

  status: z.enum(BookingStatus, { message: 'Invalid booking status' }).optional(),
  timeFrame: z.enum(BookingTimeFrame, { message: 'Invalid booking timeFrame' }).optional(),
  propertyId: z.coerce.number().int().positive().optional(),
  from: isoDateStringSchema.optional(),
  to: isoDateStringSchema.optional(),
});

export const getHostedBookingsQuerySchema = getMyBookingsQuerySchema.extend({
  guestId: z.coerce.number().int().positive().optional(),
});

export const createBookingBodySchema = z
  .object({
    propertyId: idSchema,
    checkInDate: isoDateStringSchema,
    checkOutDate: isoDateStringSchema,
    guestsCount: z.number().int().positive().max(ValidationLimits.PROPERTY.MAX_GUESTS),
    specialRequests: z
      .string()
      .trim()
      .min(1)
      .max(ValidationLimits.BOOKING.SPECIAL_REQUESTS_MAX)
      .transform((val) => sanitizeText(val))
      .optional(),
  })
  .strict()
  .superRefine((data, ctx) => validateStayDateRange({ data, ctx }));

export const cancelBookingBodySchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(ValidationLimits.BOOKING.CANCELLATION_REASON_MIN)
      .max(ValidationLimits.BOOKING.CANCELLATION_REASON_MAX)
      .transform((val) => sanitizeText(val))
      .optional(),
  })
  .strict();

// --- BOOKING ADMIN SCHEMAS ---

export const adminGetBookingsQuerySchema = getHostedBookingsQuerySchema.extend({
  hostId: z.coerce.number().int().positive().optional(),
  paymentStatus: z.enum(PaymentStatus, { message: 'Invalid payment status' }).optional(),
});

export const adminCancelBookingBodySchema = z
  .object({
    reason: z
      .string()
      .trim()
      .min(ValidationLimits.BOOKING.CANCELLATION_REASON_MIN)
      .max(ValidationLimits.BOOKING.CANCELLATION_REASON_MAX)
      .transform((val) => sanitizeText(val)),
  })
  .strict();

// --- EXPORT TYPES ---

export type BookingIdParamDto = z.infer<typeof bookingIdParamSchema>;

export type GetMyBookingsQueryDto = z.infer<typeof getMyBookingsQuerySchema>;
export type GetHostedBookingsQueryDto = z.infer<typeof getHostedBookingsQuerySchema>;
export type CreateBookingBodyDto = z.infer<typeof createBookingBodySchema>;
export type CancelBookingBodyDto = z.infer<typeof cancelBookingBodySchema>;

export type AdminGetBookingsQueryDto = z.infer<typeof adminGetBookingsQuerySchema>;
export type AdminCancelBookingBodyDto = z.infer<typeof adminCancelBookingBodySchema>;
