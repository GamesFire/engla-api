import { CancellationPolicy } from '@models/properties/property.model.js';
import { UserRole } from '@models/users/user.model.js';

export const BookingSortFields = [
  'createdAt',
  'checkInDate',
  'checkOutDate',
  'totalPrice',
] as const;

export const BookingTimeFrame = {
  UPCOMING: 'upcoming',
  CURRENT: 'current',
  PAST: 'past',
  CANCELLED: 'cancelled',
} as const;

export const UnavailableDateType = {
  BOOKED: 'booked',
  BLOCKED: 'blocked',
} as const;

export const BookingDefaults = {
  CURRENCY: 'GBP',
  AVAILABILITY_WINDOW_DAYS: 180,
  CHECK_IN_TIME: '15:00',
  CHECK_OUT_TIME: '11:00',
} as const;

/**
 * Scalable cancellation configuration defining actor-level refund overrides and
 * policy-based time tiers (ordered from highest hours before check-in to lowest).
 */
export const BookingCancellationConfig = {
  ACTOR_REFUND_RATIOS: {
    [UserRole.ADMIN]: 1,
    [UserRole.HOST]: 1,
  } as Partial<Record<UserRole, number>>,

  POLICY_TIERS: {
    [CancellationPolicy.FLEXIBLE]: [
      { minHoursBeforeCheckIn: 24, nightsRefundRatio: 1, cleaningFeeRefundRatio: 1 },
      { minHoursBeforeCheckIn: 0, nightsRefundRatio: 0.5, cleaningFeeRefundRatio: 1 },
    ],
    [CancellationPolicy.MODERATE]: [
      { minHoursBeforeCheckIn: 120, nightsRefundRatio: 1, cleaningFeeRefundRatio: 1 },
      { minHoursBeforeCheckIn: 0, nightsRefundRatio: 0.5, cleaningFeeRefundRatio: 1 },
    ],
    [CancellationPolicy.STRICT]: [
      { minHoursBeforeCheckIn: 336, nightsRefundRatio: 1, cleaningFeeRefundRatio: 1 },
      { minHoursBeforeCheckIn: 168, nightsRefundRatio: 0.5, cleaningFeeRefundRatio: 1 },
      { minHoursBeforeCheckIn: 0, nightsRefundRatio: 0, cleaningFeeRefundRatio: 1 },
    ],
  },
} as const;
