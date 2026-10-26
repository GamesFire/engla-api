import type { Modifiers, QueryBuilder } from 'objection';

import type { BookingModel } from './booking.model.js';

export const BookingModifier = {
  /**
   * Safe view for the guest who created the booking.
   * - HIDES: platformFee, hostPayout, stripeCheckoutSessionId, stripePaymentIntentId, stripeRefundId.
   * - INCLUDES: Full guest pricing breakdown, property details (exact address revealed only when confirmed/completed), and host short profile.
   */
  GUEST_VIEW: 'guestView',

  /**
   * View for the host who owns the booked property.
   * - HIDES: stripeCheckoutSessionId, stripePaymentIntentId, stripeRefundId.
   * - INCLUDES: Full financial breakdown (including platformFee and hostPayout), property details, and guest short profile.
   */
  HOST_VIEW: 'hostView',

  /**
   * View for the admin panel.
   * - INCLUDES: Everything (including Stripe identifiers, fees, and safe profiles for both guest and host).
   */
  ADMIN_VIEW: 'adminView',
} as const;

export type BookingModifierName = (typeof BookingModifier)[keyof typeof BookingModifier];

export const BookingModifiers: Modifiers<QueryBuilder<BookingModel>> = {
  [BookingModifier.GUEST_VIEW](builder) {
    builder
      .select(
        'id',
        'propertyId',
        'guestId',
        'hostId',
        'status',
        'paymentStatus',
        'checkInDate',
        'checkOutDate',
        'nights',
        'guestsCount',
        'pricePerNight',
        'cleaningFee',
        'nightsSubtotal',
        'totalPrice',
        'currency',
        'cancellationPolicy',
        'specialRequests',
        'refundedAmount',
        'expiresAt',
        'paidAt',
        'cancelledAt',
        'cancelledByRole',
        'cancellationReason',
        'completedAt',
        'createdAt',
        'updatedAt',
      )
      .withGraphFetched('[property(bookingView), host(shortProfile)]');
  },

  [BookingModifier.HOST_VIEW](builder) {
    builder
      .select(
        'id',
        'propertyId',
        'guestId',
        'hostId',
        'status',
        'paymentStatus',
        'checkInDate',
        'checkOutDate',
        'nights',
        'guestsCount',
        'pricePerNight',
        'cleaningFee',
        'nightsSubtotal',
        'totalPrice',
        'platformFee',
        'hostPayout',
        'currency',
        'cancellationPolicy',
        'specialRequests',
        'refundedAmount',
        'expiresAt',
        'paidAt',
        'cancelledAt',
        'cancelledByRole',
        'cancellationReason',
        'completedAt',
        'createdAt',
        'updatedAt',
      )
      .withGraphFetched('[property(bookingView), guest(shortProfile)]');
  },

  [BookingModifier.ADMIN_VIEW](builder) {
    builder.withGraphFetched('[property(bookingView), guest(safeView), host(safeView)]');
  },
};
