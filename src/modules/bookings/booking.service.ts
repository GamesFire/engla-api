import dayjs from 'dayjs';
import { Decimal } from 'decimal.js';
import { inject } from 'inversify';

import type { PaginatedResponse } from '@app/interfaces/pagination.interface.js';
import { provide } from '@ioc/decorators.js';
import { appConfig } from '@lib/configs/app.config.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { RequestConfig } from '@lib/constants/limits.js';
import { HttpError } from '@lib/errors/http.error.js';
import { StripeService } from '@lib/integrations/stripe/stripe.service.js';
import { logger } from '@lib/logger.js';
import { type Booking, BookingStatus, PaymentStatus } from '@models/bookings/booking.model.js';
import { BookingModifier } from '@models/bookings/booking.modifiers.js';
import {
  CancellationPolicy,
  type Property,
  PropertyStatus,
} from '@models/properties/property.model.js';
import { type User, UserRole } from '@models/users/user.model.js';
import { PropertyBlockedDateRepository } from '@modules/properties/property-blocked-date.repository.js';
import { PropertyRepository } from '@modules/properties/property.repository.js';
import { UserRepository } from '@modules/users/user.repository.js';
import type { CreateBookingBodyDto } from '@routes/bookings/booking.validation.js';
import { formatPropertyFallbackTitle } from '@utils/format.js';

import {
  BookingCancellationConfig,
  BookingDefaults,
  UnavailableDateType,
} from './booking.constants.js';
import { BookingRepository } from './booking.repository.js';
import type {
  BookingPriceQuote,
  BookingPricingBreakdown,
  CalculateBookingPricingParams,
  CalculateCancellationRefundParams,
  CancelBookingByActorParams,
  CancelBookingByAdminParams,
  ConfirmBookingPaymentParams,
  CreateBookingPaymentSessionResult,
  CreateBookingResult,
  FindBookingOptions,
  GetBookingPriceQuoteParams,
  GetBookingsByAdminParams,
  GetGuestBookingsParams,
  GetHostBookingsParams,
  GetPropertyAvailabilityParams,
  PropertyAvailabilityResult,
  UnavailableDateRange,
} from './booking.types.js';

@provide()
export class BookingService {
  constructor(
    @inject(BookingRepository) private readonly _bookingRepository: BookingRepository,
    @inject(PropertyRepository) private readonly _propertyRepository: PropertyRepository,
    @inject(PropertyBlockedDateRepository)
    private readonly _propertyBlockedDateRepository: PropertyBlockedDateRepository,
    @inject(UserRepository) private readonly _userRepository: UserRepository,
    @inject(StripeService) private readonly _stripeService: StripeService,
  ) {}

  private async _getExistingBooking(
    bookingId: number,
    options?: FindBookingOptions,
  ): Promise<Booking> {
    const booking = await this._bookingRepository.findById(bookingId, options);

    if (!booking) {
      throw new HttpError({
        statusCode: 404,
        message: ErrorMessages.BOOKINGS.NOT_FOUND,
        internalPayload: { code: ErrorCodes.BOOKINGS.NOT_FOUND },
      });
    }

    return booking;
  }

  private async _getActiveProperty(propertyId: number): Promise<Property> {
    const property = await this._propertyRepository.findById(propertyId, { modifiers: null });

    if (!property || property.status !== PropertyStatus.ACTIVE) {
      throw new HttpError({
        statusCode: 404,
        message: ErrorMessages.PROPERTIES.NOT_FOUND,
        internalPayload: { code: ErrorCodes.PROPERTIES.NOT_FOUND },
      });
    }

    return property;
  }

  /**
   * Calculates the exact financial breakdown in pence using arbitrary-precision Decimal math.
   *
   * @param params - The property entity and stay date boundaries.
   * @returns The calculated pricing breakdown in pence.
   */
  private _calculatePricing(params: CalculateBookingPricingParams): BookingPricingBreakdown {
    const { property, checkInDate, checkOutDate } = params;

    const nights = dayjs(checkOutDate)
      .startOf('day')
      .diff(dayjs(checkInDate).startOf('day'), 'day');
    const pricePerNight = property.pricePerNight ?? 0;
    const cleaningFee = property.cleaningFee ?? 0;

    const nightsSubtotal = new Decimal(pricePerNight).mul(nights).toNumber();
    const totalPrice = new Decimal(nightsSubtotal).plus(cleaningFee).toNumber();

    const platformFee = new Decimal(totalPrice)
      .mul(appConfig.STRIPE_PLATFORM_FEE_PERCENT)
      .div(100)
      .round()
      .toNumber();

    const hostPayout = new Decimal(totalPrice).minus(platformFee).toNumber();

    const pricingBreakdown: BookingPricingBreakdown = {
      nights,
      pricePerNight,
      cleaningFee,
      nightsSubtotal,
      totalPrice,
      platformFee,
      hostPayout,
    };

    return pricingBreakdown;
  }

  /**
   * Computes the refund amount in pence for a booking cancellation dynamically based on
   * the cancelling actor's role override or the booking's snapshot cancellation policy tiers.
   *
   * @param params - The booking entity, cancelling actor role, and property check-in time.
   * @returns The calculated refund amount in pence.
   */
  private _calculateCancellationRefund(params: CalculateCancellationRefundParams): number {
    const { booking, cancelledByRole, checkInTime } = params;

    const actorOverrideRatio = BookingCancellationConfig.ACTOR_REFUND_RATIOS[cancelledByRole];

    if (actorOverrideRatio !== undefined) {
      return new Decimal(booking.totalPrice).mul(actorOverrideRatio).round().toNumber();
    }

    const effectiveCheckInTime = checkInTime || BookingDefaults.CHECK_IN_TIME;
    const checkInDateTime = dayjs(`${booking.checkInDate}T${effectiveCheckInTime}:00`);
    const hoursUntilCheckIn = checkInDateTime.diff(dayjs(), 'hour', true);

    const policyTiers = BookingCancellationConfig.POLICY_TIERS[booking.cancellationPolicy];
    const matchedTier =
      policyTiers.find((tier) => hoursUntilCheckIn >= tier.minHoursBeforeCheckIn) ??
      policyTiers[policyTiers.length - 1];

    if (!matchedTier) {
      return 0;
    }

    const refundedNightsAmount = new Decimal(booking.nightsSubtotal)
      .mul(matchedTier.nightsRefundRatio)
      .round();
    const refundedCleaningFee = new Decimal(booking.cleaningFee)
      .mul(matchedTier.cleaningFeeRefundRatio)
      .round();

    return refundedNightsAmount.plus(refundedCleaningFee).toNumber();
  }

  public async getPropertyAvailability(
    params: GetPropertyAvailabilityParams,
  ): Promise<PropertyAvailabilityResult> {
    const { propertyId, query } = params;

    await this._getActiveProperty(propertyId);

    const from = query.from ?? dayjs().format('YYYY-MM-DD');
    const to =
      query.to ??
      dayjs(from).add(BookingDefaults.AVAILABILITY_WINDOW_DAYS, 'day').format('YYYY-MM-DD');

    const [bookings, blockedDates] = await Promise.all([
      this._bookingRepository.getOccupyingBookingsInDateRange({ propertyId, from, to }),
      this._propertyBlockedDateRepository.findAllByPropertyId(propertyId, { from, to }),
    ]);

    const unavailableDates: UnavailableDateRange[] = [
      ...bookings.map((b) => ({
        startDate: b.checkInDate,
        endDate: b.checkOutDate,
        type: UnavailableDateType.BOOKED,
      })),
      ...blockedDates.map((bd) => ({
        startDate: bd.startDate,
        endDate: bd.endDate,
        type: UnavailableDateType.BLOCKED,
      })),
    ].sort((a, b) => a.startDate.localeCompare(b.startDate));

    const availabilityResult: PropertyAvailabilityResult = {
      propertyId,
      from,
      to,
      unavailableDates,
    };

    return availabilityResult;
  }

  public async getBookingPriceQuote(
    params: GetBookingPriceQuoteParams,
  ): Promise<BookingPriceQuote> {
    const { propertyId, query } = params;

    const property = await this._getActiveProperty(propertyId);

    if (property.maxGuests && query.guestsCount > property.maxGuests) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.BOOKINGS.GUEST_CAPACITY_EXCEEDED,
        internalPayload: {
          code: ErrorCodes.BOOKINGS.GUEST_CAPACITY_EXCEEDED,
          maxGuests: property.maxGuests,
        },
      });
    }

    const isAvailable = await this._bookingRepository.isPropertyAvailable({
      propertyId,
      checkInDate: query.checkInDate,
      checkOutDate: query.checkOutDate,
    });

    const pricing = this._calculatePricing({
      property,
      checkInDate: query.checkInDate,
      checkOutDate: query.checkOutDate,
    });

    const priceQuote: BookingPriceQuote = {
      propertyId,
      checkInDate: query.checkInDate,
      checkOutDate: query.checkOutDate,
      nights: pricing.nights,
      guestsCount: query.guestsCount,
      isAvailable,
      currency: BookingDefaults.CURRENCY,
      pricePerNight: pricing.pricePerNight,
      cleaningFee: pricing.cleaningFee,
      nightsSubtotal: pricing.nightsSubtotal,
      totalPrice: pricing.totalPrice,
      cancellationPolicy: property.cancellationPolicy ?? CancellationPolicy.MODERATE,
    };

    return priceQuote;
  }

  public async getBookingsByGuestId(
    guestId: number,
    params: GetGuestBookingsParams,
  ): Promise<PaginatedResponse<Booking>> {
    return this._bookingRepository.getBookingsByGuestId(guestId, params);
  }

  public async getBookingsByHostId(
    hostId: number,
    params: GetHostBookingsParams,
  ): Promise<PaginatedResponse<Booking>> {
    return this._bookingRepository.getBookingsByHostId(hostId, params);
  }

  public async getBookingByIdForActor(bookingId: number, userId: number): Promise<Booking> {
    const rawBooking = await this._getExistingBooking(bookingId, { modifiers: null });

    if (rawBooking.guestId === userId) {
      return this._getExistingBooking(bookingId, { modifiers: BookingModifier.GUEST_VIEW });
    }

    if (rawBooking.hostId === userId) {
      return this._getExistingBooking(bookingId, { modifiers: BookingModifier.HOST_VIEW });
    }

    throw new HttpError({
      statusCode: 404,
      message: ErrorMessages.BOOKINGS.NOT_FOUND,
      internalPayload: { code: ErrorCodes.BOOKINGS.NOT_FOUND },
    });
  }

  public async createBooking(guest: User, dto: CreateBookingBodyDto): Promise<CreateBookingResult> {
    const activePendingCount = await this._bookingRepository.countActivePendingBookingsByGuestId(
      guest.id,
    );

    if (activePendingCount >= RequestConfig.BUSINESS.MAX_PENDING_BOOKINGS_PER_GUEST) {
      throw new HttpError({
        statusCode: 429,
        message: ErrorMessages.BOOKINGS.TOO_MANY_PENDING,
        internalPayload: {
          code: ErrorCodes.BOOKINGS.TOO_MANY_PENDING,
          limit: RequestConfig.BUSINESS.MAX_PENDING_BOOKINGS_PER_GUEST,
        },
      });
    }

    const property = await this._getActiveProperty(dto.propertyId);

    if (property.hostId === guest.id) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.BOOKINGS.CANNOT_BOOK_OWN_PROPERTY,
        internalPayload: { code: ErrorCodes.BOOKINGS.CANNOT_BOOK_OWN_PROPERTY },
      });
    }

    if (!property.maxGuests || dto.guestsCount > property.maxGuests) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.BOOKINGS.GUEST_CAPACITY_EXCEEDED,
        internalPayload: {
          code: ErrorCodes.BOOKINGS.GUEST_CAPACITY_EXCEEDED,
          maxGuests: property.maxGuests,
        },
      });
    }

    const host = await this._userRepository.findById(property.hostId, { modifiers: null });

    if (!host || !host.stripeAccountId || !host.stripeOnboardingCompleted) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.BOOKINGS.HOST_PAYOUTS_NOT_READY,
        internalPayload: { code: ErrorCodes.BOOKINGS.HOST_PAYOUTS_NOT_READY },
      });
    }

    const pricing = this._calculatePricing({
      property,
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
    });
    const expiresAt = dayjs().add(appConfig.CRON_BOOKING_EXPIRATION_MINUTES, 'minute').toDate();

    const pendingBooking = await this._bookingRepository.createPendingBookingAtomically({
      propertyId: property.id,
      guestId: guest.id,
      hostId: property.hostId,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.UNPAID,
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
      nights: pricing.nights,
      guestsCount: dto.guestsCount,
      pricePerNight: pricing.pricePerNight,
      cleaningFee: pricing.cleaningFee,
      nightsSubtotal: pricing.nightsSubtotal,
      totalPrice: pricing.totalPrice,
      platformFee: pricing.platformFee,
      hostPayout: pricing.hostPayout,
      currency: BookingDefaults.CURRENCY,
      cancellationPolicy: property.cancellationPolicy ?? CancellationPolicy.MODERATE,
      specialRequests: dto.specialRequests ?? null,
      expiresAt,
    });

    if (!pendingBooking) {
      throw new HttpError({
        statusCode: 409,
        message: ErrorMessages.BOOKINGS.PROPERTY_NOT_AVAILABLE,
        internalPayload: { code: ErrorCodes.BOOKINGS.PROPERTY_NOT_AVAILABLE },
      });
    }

    try {
      const checkoutSession = await this._stripeService.createBookingCheckoutSession({
        bookingId: pendingBooking.id,
        propertyId: property.id,
        propertyTitle: property.title ?? formatPropertyFallbackTitle(property.id),
        guestId: guest.id,
        guestEmail: guest.email,
        hostId: host.id,
        hostStripeAccountId: host.stripeAccountId,
        checkInDate: dto.checkInDate,
        checkOutDate: dto.checkOutDate,
        nights: pricing.nights,
        pricePerNight: pricing.pricePerNight,
        cleaningFee: pricing.cleaningFee,
        platformFee: pricing.platformFee,
        expiresAt,
      });

      const updatedBooking = await this._bookingRepository.updateAndFetchById({
        bookingId: pendingBooking.id,
        data: {
          stripeCheckoutSessionId: checkoutSession.sessionId,
        },
        options: { modifiers: BookingModifier.GUEST_VIEW },
      });

      const createBookingResult: CreateBookingResult = {
        booking: updatedBooking,
        checkoutUrl: checkoutSession.checkoutUrl,
      };

      return createBookingResult;
    } catch (error) {
      await this._bookingRepository.hardDeleteById(pendingBooking.id);
      throw error;
    }
  }

  public async createPaymentSessionForBooking(
    guest: User,
    bookingId: number,
  ): Promise<CreateBookingPaymentSessionResult> {
    const booking = await this._getExistingBooking(bookingId, { modifiers: null });

    if (booking.guestId !== guest.id) {
      throw new HttpError({
        statusCode: 404,
        message: ErrorMessages.BOOKINGS.NOT_FOUND,
        internalPayload: { code: ErrorCodes.BOOKINGS.NOT_FOUND },
      });
    }

    if (
      booking.status !== BookingStatus.PENDING ||
      booking.paymentStatus !== PaymentStatus.UNPAID
    ) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.BOOKINGS.NOT_PENDING,
        internalPayload: { code: ErrorCodes.BOOKINGS.NOT_PENDING },
      });
    }

    if (booking.expiresAt && booking.expiresAt <= new Date()) {
      await this._bookingRepository.updateAndFetchById({
        bookingId: booking.id,
        data: {
          status: BookingStatus.EXPIRED,
          paymentStatus: PaymentStatus.FAILED,
        },
      });

      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.BOOKINGS.EXPIRED,
        internalPayload: { code: ErrorCodes.BOOKINGS.EXPIRED },
      });
    }

    const property = await this._getActiveProperty(booking.propertyId);
    const host = await this._userRepository.findById(booking.hostId, { modifiers: null });

    if (!host || !host.stripeAccountId || !host.stripeOnboardingCompleted) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.BOOKINGS.HOST_PAYOUTS_NOT_READY,
        internalPayload: { code: ErrorCodes.BOOKINGS.HOST_PAYOUTS_NOT_READY },
      });
    }

    if (booking.stripeCheckoutSessionId) {
      await this._stripeService.expireCheckoutSession(booking.stripeCheckoutSessionId);
    }

    const refreshedExpiresAt = dayjs()
      .add(appConfig.CRON_BOOKING_EXPIRATION_MINUTES, 'minute')
      .toDate();

    const checkoutSession = await this._stripeService.createBookingCheckoutSession({
      bookingId: booking.id,
      propertyId: property.id,
      propertyTitle: property.title ?? formatPropertyFallbackTitle(property.id),
      guestId: guest.id,
      guestEmail: guest.email,
      hostId: host.id,
      hostStripeAccountId: host.stripeAccountId,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      nights: booking.nights,
      pricePerNight: booking.pricePerNight,
      cleaningFee: booking.cleaningFee,
      platformFee: booking.platformFee ?? 0,
      expiresAt: refreshedExpiresAt,
    });

    await this._bookingRepository.updateAndFetchById({
      bookingId: booking.id,
      data: {
        stripeCheckoutSessionId: checkoutSession.sessionId,
        expiresAt: refreshedExpiresAt,
      },
    });

    const paymentSessionResult: CreateBookingPaymentSessionResult = {
      checkoutUrl: checkoutSession.checkoutUrl,
    };

    return paymentSessionResult;
  }

  public async cancelBookingByActor(params: CancelBookingByActorParams): Promise<Booking> {
    const { bookingId, userId, data } = params;

    const booking = await this._getExistingBooking(bookingId, { modifiers: null });

    const isGuest = booking.guestId === userId;
    const isHost = booking.hostId === userId;

    if (!isGuest && !isHost) {
      throw new HttpError({
        statusCode: 404,
        message: ErrorMessages.BOOKINGS.NOT_FOUND,
        internalPayload: { code: ErrorCodes.BOOKINGS.NOT_FOUND },
      });
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.EXPIRED
    ) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.BOOKINGS.ALREADY_TERMINATED,
        internalPayload: { code: ErrorCodes.BOOKINGS.ALREADY_TERMINATED },
      });
    }

    const property = await this._propertyRepository.findById(booking.propertyId, {
      modifiers: null,
      includeDeleted: true,
    });

    const checkInTime = property?.checkInTime || BookingDefaults.CHECK_IN_TIME;
    const checkInDateTime = dayjs(`${booking.checkInDate}T${checkInTime}:00`);

    if (dayjs().isAfter(checkInDateTime)) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.BOOKINGS.STAY_ALREADY_STARTED,
        internalPayload: { code: ErrorCodes.BOOKINGS.STAY_ALREADY_STARTED },
      });
    }

    const cancelledByRole = isHost ? UserRole.HOST : UserRole.CLIENT;
    const viewModifier = isHost ? BookingModifier.HOST_VIEW : BookingModifier.GUEST_VIEW;

    if (booking.status === BookingStatus.PENDING) {
      if (booking.stripeCheckoutSessionId) {
        await this._stripeService.expireCheckoutSession(booking.stripeCheckoutSessionId);
      }

      return this._bookingRepository.updateAndFetchById({
        bookingId: booking.id,
        data: {
          status: BookingStatus.CANCELLED,
          cancelledAt: new Date(),
          cancelledByRole,
          cancellationReason: data.reason ?? null,
          expiresAt: null,
        },
        options: { modifiers: viewModifier },
      });
    }

    const refundAmount = this._calculateCancellationRefund({
      booking,
      cancelledByRole,
      checkInTime: property?.checkInTime,
    });

    let stripeRefundId: Nullable<string> = null;
    let newPaymentStatus = booking.paymentStatus;

    if (
      refundAmount > 0 &&
      booking.paymentStatus === PaymentStatus.PAID &&
      booking.stripePaymentIntentId
    ) {
      const isFullRefund = refundAmount >= booking.totalPrice;

      stripeRefundId = await this._stripeService.refundPayment({
        paymentIntentId: booking.stripePaymentIntentId,
        amount: refundAmount,
        isFullRefund,
        bookingId: booking.id,
      });

      newPaymentStatus = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
    }

    return this._bookingRepository.updateAndFetchById({
      bookingId: booking.id,
      data: {
        status: BookingStatus.CANCELLED,
        paymentStatus: newPaymentStatus,
        refundedAmount: refundAmount,
        stripeRefundId,
        cancelledAt: new Date(),
        cancelledByRole,
        cancellationReason: data.reason ?? null,
      },
      options: { modifiers: viewModifier },
    });
  }

  public async getBookingsByAdmin(
    params: GetBookingsByAdminParams,
  ): Promise<PaginatedResponse<Booking>> {
    return this._bookingRepository.getBookingsByAdmin(params);
  }

  public async getBookingByIdForAdmin(bookingId: number): Promise<Booking> {
    return this._getExistingBooking(bookingId, {
      modifiers: BookingModifier.ADMIN_VIEW,
    });
  }

  public async cancelBookingByAdmin(params: CancelBookingByAdminParams): Promise<Booking> {
    const { bookingId, data } = params;

    const booking = await this._getExistingBooking(bookingId, { modifiers: null });

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.COMPLETED ||
      booking.status === BookingStatus.EXPIRED
    ) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.BOOKINGS.ALREADY_TERMINATED,
        internalPayload: { code: ErrorCodes.BOOKINGS.ALREADY_TERMINATED },
      });
    }

    if (booking.status === BookingStatus.PENDING && booking.stripeCheckoutSessionId) {
      await this._stripeService.expireCheckoutSession(booking.stripeCheckoutSessionId);
    }

    let stripeRefundId: Nullable<string> = null;
    let newPaymentStatus = booking.paymentStatus;
    let refundedAmount = booking.refundedAmount;

    if (
      booking.status === BookingStatus.CONFIRMED &&
      booking.paymentStatus === PaymentStatus.PAID &&
      booking.stripePaymentIntentId
    ) {
      const calculatedRefund = this._calculateCancellationRefund({
        booking,
        cancelledByRole: UserRole.ADMIN,
      });

      if (calculatedRefund > 0) {
        const isFullRefund = calculatedRefund >= booking.totalPrice;

        stripeRefundId = await this._stripeService.refundPayment({
          paymentIntentId: booking.stripePaymentIntentId,
          amount: calculatedRefund,
          isFullRefund,
          bookingId: booking.id,
        });

        newPaymentStatus = isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
        refundedAmount = calculatedRefund;
      }
    }

    return this._bookingRepository.updateAndFetchById({
      bookingId: booking.id,
      data: {
        status: BookingStatus.CANCELLED,
        paymentStatus: newPaymentStatus,
        refundedAmount,
        stripeRefundId,
        cancelledAt: new Date(),
        cancelledByRole: UserRole.ADMIN,
        cancellationReason: data.reason,
        expiresAt: null,
      },
      options: { modifiers: BookingModifier.ADMIN_VIEW },
    });
  }

  /**
   * Confirms a booking upon receiving a verified `checkout.session.completed` webhook from Stripe.
   * Idempotent and safe against duplicate webhook deliveries.
   *
   * @param params - The Checkout Session ID, PaymentIntent ID, and optional metadata booking ID.
   * @returns A Promise that resolves when the booking payment status is updated.
   */
  public async confirmBookingPayment(params: ConfirmBookingPaymentParams): Promise<void> {
    const { sessionId, paymentIntentId, bookingIdFromMetadata } = params;

    let booking = await this._bookingRepository.findByCheckoutSessionId(sessionId, {
      modifiers: null,
    });

    if (!booking && bookingIdFromMetadata) {
      booking = await this._bookingRepository.findById(bookingIdFromMetadata, {
        modifiers: null,
      });
    }

    if (!booking) {
      logger.warn(
        `[BookingService] Webhook received for unknown Checkout Session ID: ${sessionId}`,
      );
      return;
    }

    if (
      booking.status === BookingStatus.CONFIRMED &&
      booking.paymentStatus === PaymentStatus.PAID
    ) {
      logger.info(
        `[BookingService] Booking #${booking.id} is already CONFIRMED. Ignoring duplicate webhook.`,
      );
      return;
    }

    await this._bookingRepository.updateAndFetchById({
      bookingId: booking.id,
      data: {
        status: BookingStatus.CONFIRMED,
        paymentStatus: PaymentStatus.PAID,
        stripePaymentIntentId: paymentIntentId,
        paidAt: new Date(),
        expiresAt: null,
      },
      options: { modifiers: null },
    });

    logger.info(
      `[BookingService] Booking #${booking.id} successfully CONFIRMED (PaymentIntent: ${paymentIntentId ?? 'N/A'})`,
    );
  }

  /**
   * Transitions a pending booking to EXPIRED when its Stripe Checkout Session expires.
   *
   * @param sessionId - The expired Stripe Checkout Session ID.
   * @returns A Promise that resolves when the booking status is updated.
   */
  public async expirePendingBookingBySessionId(sessionId: string): Promise<void> {
    const booking = await this._bookingRepository.findByCheckoutSessionId(sessionId, {
      modifiers: null,
    });

    if (!booking) {
      logger.debug(
        `[BookingService] Checkout Session expired for unknown session ID: ${sessionId}`,
      );
      return;
    }

    if (booking.status !== BookingStatus.PENDING) {
      return;
    }

    await this._bookingRepository.updateAndFetchById({
      bookingId: booking.id,
      data: {
        status: BookingStatus.EXPIRED,
        paymentStatus: PaymentStatus.FAILED,
      },
      options: { modifiers: null },
    });

    logger.info(`[BookingService] Booking #${booking.id} marked as EXPIRED via webhook.`);
  }

  /**
   * Records a failed payment attempt on a pending booking.
   *
   * @param paymentIntentId - The Stripe PaymentIntent ID that failed.
   * @param bookingIdFromMetadata - Optional booking ID extracted from PaymentIntent metadata.
   * @returns A Promise that resolves when the failure is logged.
   */
  public async handleFailedPaymentAttempt(
    paymentIntentId: string,
    bookingIdFromMetadata?: number,
  ): Promise<void> {
    const booking = bookingIdFromMetadata
      ? await this._bookingRepository.findById(bookingIdFromMetadata, { modifiers: null })
      : await this._bookingRepository.findByPaymentIntentId(paymentIntentId, { modifiers: null });

    if (!booking) {
      return;
    }

    logger.warn(
      `[BookingService] Payment attempt failed for booking #${booking.id} (PaymentIntent: ${paymentIntentId})`,
    );
  }

  /**
   * Expires overdue PENDING bookings and closes their open Stripe Checkout Sessions.
   *
   * @returns A Promise that resolves when all overdue bookings have been expired.
   */
  public async expireOverduePendingBookings(): Promise<void> {
    const expiredBookings = await this._bookingRepository.findExpiredPendingBookings();

    if (expiredBookings.length === 0) return;

    logger.info(
      `[BookingService] Found ${expiredBookings.length} overdue pending booking(s) to expire.`,
    );

    for (const booking of expiredBookings) {
      if (booking.stripeCheckoutSessionId) {
        await this._stripeService.expireCheckoutSession(booking.stripeCheckoutSessionId);
      }

      await this._bookingRepository.updateAndFetchById({
        bookingId: booking.id,
        data: {
          status: BookingStatus.EXPIRED,
          paymentStatus: PaymentStatus.FAILED,
        },
        options: { modifiers: null },
      });
    }

    logger.info(
      `[BookingService] Successfully expired ${expiredBookings.length} overdue pending booking(s).`,
    );
  }

  /**
   * Transitions CONFIRMED bookings whose check-out date has passed to COMPLETED.
   *
   * @returns A Promise that resolves when past bookings have been marked as completed.
   */
  public async completeFinishedBookings(): Promise<void> {
    const todayStr = dayjs().format('YYYY-MM-DD');
    const completedCount = await this._bookingRepository.completePastConfirmedBookings(todayStr);

    if (completedCount > 0) {
      logger.info(
        `[BookingService] Automatically marked ${completedCount} finished booking(s) as COMPLETED.`,
      );
    }
  }
}
