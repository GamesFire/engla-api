import type { Transaction } from 'objection';

import type { Booking } from '@models/bookings/booking.model.js';
import type { BookingModifierName } from '@models/bookings/booking.modifiers.js';
import type { CancellationPolicy, Property } from '@models/properties/property.model.js';
import type { UserRole } from '@models/users/user.model.js';
import type {
  AdminCancelBookingBodyDto,
  AdminGetBookingsQueryDto,
  CancelBookingBodyDto,
  GetHostedBookingsQueryDto,
  GetMyBookingsQueryDto,
} from '@routes/bookings/booking.validation.js';
import type {
  GetPropertyAvailabilityQueryDto,
  GetPropertyQuoteQueryDto,
} from '@routes/properties/property.validation.js';

import type { BookingTimeFrame, UnavailableDateType } from './booking.constants.js';

export type BookingTimeFrameValue = (typeof BookingTimeFrame)[keyof typeof BookingTimeFrame];
export type UnavailableDateTypeValue =
  (typeof UnavailableDateType)[keyof typeof UnavailableDateType];

export type BookingQueryOptions = {
  /**
   * Booking modifiers to apply to the query result.
   * Behaviors:
   * - `undefined`: Defaults to **'guestView'** (Hides internal fee splits and Stripe IDs).
   * - `null`: Returns **raw model** (All fields).
   * - `string` or `string[]`: Applies specific modifiers (e.g., `BookingModifier.HOST_VIEW`).
   * @remarks Keys are strongly typed via {@link BookingModifierName}.
   */
  modifiers?: Nullable<BookingModifierName | BookingModifierName[]>;
};

export type FindBookingOptions = BookingQueryOptions;

export type GetGuestBookingsParams = GetMyBookingsQueryDto;
export type GetHostBookingsParams = GetHostedBookingsQueryDto;
export type GetBookingsByAdminParams = AdminGetBookingsQueryDto;

export type CreateBookingData = Pick<
  Booking,
  | 'propertyId'
  | 'guestId'
  | 'hostId'
  | 'status'
  | 'paymentStatus'
  | 'checkInDate'
  | 'checkOutDate'
  | 'nights'
  | 'guestsCount'
  | 'pricePerNight'
  | 'cleaningFee'
  | 'nightsSubtotal'
  | 'totalPrice'
  | 'currency'
  | 'cancellationPolicy'
  | 'specialRequests'
  | 'expiresAt'
> & {
  platformFee: number;
  hostPayout: number;
};

export type UpdateBookingData = Partial<
  Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'property' | 'guest' | 'host'>
>;

export type UpdateBookingParams = {
  bookingId: number;
  data: UpdateBookingData;
  options?: BookingQueryOptions;
};

export type CheckBookingAvailabilityParams = {
  propertyId: number;
  checkInDate: string;
  checkOutDate: string;
  trx?: Transaction;
};

export type GetOccupyingBookingsRangeParams = {
  propertyId: number;
  from: string;
  to: string;
};

export type OccupyingBookingDateRange = Pick<Booking, 'checkInDate' | 'checkOutDate'>;

export type CalculateBookingPricingParams = {
  property: Property;
  checkInDate: string;
  checkOutDate: string;
};

export type BookingPricingBreakdown = {
  nights: number;
  pricePerNight: number;
  cleaningFee: number;
  nightsSubtotal: number;
  totalPrice: number;
  platformFee: number;
  hostPayout: number;
};

export type CalculateCancellationRefundParams = {
  booking: Booking;
  cancelledByRole: UserRole;
  checkInTime?: Nullable<string>;
};

export type GetPropertyAvailabilityParams = {
  propertyId: number;
  query: GetPropertyAvailabilityQueryDto;
};

export type GetBookingPriceQuoteParams = {
  propertyId: number;
  query: GetPropertyQuoteQueryDto;
};

export type CancelBookingByActorParams = {
  bookingId: number;
  userId: number;
  userRole: UserRole;
  data: CancelBookingBodyDto;
};

export type CancelBookingByAdminParams = {
  bookingId: number;
  data: AdminCancelBookingBodyDto;
};

export type ConfirmBookingPaymentParams = {
  sessionId: string;
  paymentIntentId: Nullable<string>;
  bookingIdFromMetadata?: number;
};

export type UnavailableDateRange = {
  startDate: string;
  endDate: string;
  type: UnavailableDateTypeValue;
};

export type PropertyAvailabilityResult = {
  propertyId: number;
  from: string;
  to: string;
  unavailableDates: UnavailableDateRange[];
};

export type BookingPriceQuote = {
  propertyId: number;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestsCount: number;
  isAvailable: boolean;
  currency: string;
  pricePerNight: number;
  cleaningFee: number;
  nightsSubtotal: number;
  totalPrice: number;
  cancellationPolicy: CancellationPolicy;
};

export type CreateBookingResult = {
  booking: Booking;
  checkoutUrl: string;
};

export type CreateBookingPaymentSessionResult = {
  checkoutUrl: string;
};
