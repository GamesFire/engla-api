/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from 'dayjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorCodes } from '@lib/constants/errors.js';
import { RequestConfig } from '@lib/constants/limits.js';
import { HttpError } from '@lib/errors/http.error.js';
import { BookingStatus, PaymentStatus } from '@models/bookings/booking.model.js';
import { CancellationPolicy, PropertyStatus } from '@models/properties/property.model.js';
import { UserRole } from '@models/users/user.model.js';
import { BookingService } from '@modules/bookings/booking.service.js';

describe('BookingService', () => {
  let mockBookingRepo: any;
  let mockPropertyRepo: any;
  let mockBlockedDateRepo: any;
  let mockUserRepo: any;
  let mockStripeService: any;
  let bookingService: BookingService;

  const checkInDate = dayjs().add(10, 'day').format('YYYY-MM-DD');
  const checkOutDate = dayjs().add(14, 'day').format('YYYY-MM-DD'); // 4 nights

  beforeEach(() => {
    mockBookingRepo = {
      findById: vi.fn(),
      findByCheckoutSessionId: vi.fn(),
      isPropertyAvailable: vi.fn(),
      createPendingBookingAtomically: vi.fn(),
      countActivePendingBookingsByGuestId: vi.fn().mockResolvedValue(0),
      updateAndFetchById: vi.fn(),
      hardDeleteById: vi.fn(),
    };
    mockPropertyRepo = {
      findById: vi.fn(),
    };
    mockBlockedDateRepo = {
      findAllByPropertyId: vi.fn(),
    };
    mockUserRepo = {
      findById: vi.fn(),
    };
    mockStripeService = {
      createBookingCheckoutSession: vi.fn(),
      expireCheckoutSession: vi.fn(),
      refundPayment: vi.fn(),
    };

    bookingService = new BookingService(
      mockBookingRepo,
      mockPropertyRepo,
      mockBlockedDateRepo,
      mockUserRepo,
      mockStripeService,
    );
  });

  it('calculates an accurate price quote for an active property', async () => {
    mockPropertyRepo.findById.mockResolvedValue({
      id: 1,
      status: PropertyStatus.ACTIVE,
      maxGuests: 4,
      pricePerNight: 20000, // £200.00
      cleaningFee: 5000, // £50.00
      cancellationPolicy: CancellationPolicy.MODERATE,
    });
    mockBookingRepo.isPropertyAvailable.mockResolvedValue(true);

    const quote = await bookingService.getBookingPriceQuote({
      propertyId: 1,
      query: {
        checkInDate,
        checkOutDate,
        guestsCount: 2,
      },
    });

    expect(quote).toEqual({
      propertyId: 1,
      checkInDate,
      checkOutDate,
      nights: 4,
      guestsCount: 2,
      isAvailable: true,
      currency: 'GBP',
      pricePerNight: 20000,
      cleaningFee: 5000,
      nightsSubtotal: 80000,
      totalPrice: 85000,
      cancellationPolicy: CancellationPolicy.MODERATE,
    });
  });

  it('prevents a host from booking their own property', async () => {
    mockPropertyRepo.findById.mockResolvedValue({
      id: 1,
      hostId: 2,
      status: PropertyStatus.ACTIVE,
      maxGuests: 4,
      pricePerNight: 20000,
      cleaningFee: 0,
    });

    const hostAsGuest = { id: 2, email: 'host@example.com', role: UserRole.HOST } as any;

    await expect(
      bookingService.createBooking(hostAsGuest, {
        propertyId: 1,
        checkInDate,
        checkOutDate,
        guestsCount: 2,
      }),
    ).rejects.toThrow(
      expect.objectContaining({
        statusCode: 400,
        internalPayload: { code: ErrorCodes.BOOKINGS.CANNOT_BOOK_OWN_PROPERTY },
      }),
    );
  });

  it('rejects new bookings when the guest exceeds the active pending bookings cap', async () => {
    mockBookingRepo.countActivePendingBookingsByGuestId.mockResolvedValue(
      RequestConfig.BUSINESS.MAX_PENDING_BOOKINGS_PER_GUEST,
    );

    const guest = { id: 7, email: 'guest@example.com', role: UserRole.CLIENT } as any;

    await expect(
      bookingService.createBooking(guest, {
        propertyId: 1,
        checkInDate,
        checkOutDate,
        guestsCount: 2,
      }),
    ).rejects.toThrow(
      expect.objectContaining({
        statusCode: 429,
        internalPayload: expect.objectContaining({ code: ErrorCodes.BOOKINGS.TOO_MANY_PENDING }),
      }),
    );

    expect(mockPropertyRepo.findById).not.toHaveBeenCalled();
    expect(mockBookingRepo.createPendingBookingAtomically).not.toHaveBeenCalled();
  });

  it('rolls back the pending booking if Stripe Checkout Session creation fails', async () => {
    mockPropertyRepo.findById.mockResolvedValue({
      id: 1,
      hostId: 2,
      title: 'Test Villa',
      status: PropertyStatus.ACTIVE,
      maxGuests: 4,
      pricePerNight: 10000,
      cleaningFee: 2000,
      cancellationPolicy: CancellationPolicy.FLEXIBLE,
    });
    mockUserRepo.findById.mockResolvedValue({
      id: 2,
      stripeAccountId: 'acct_host123',
      stripeOnboardingCompleted: true,
    });
    mockBookingRepo.createPendingBookingAtomically.mockResolvedValue({
      id: 99,
      propertyId: 1,
    });
    mockStripeService.createBookingCheckoutSession.mockRejectedValue(
      new HttpError({ statusCode: 502, message: 'Stripe down' }),
    );

    const guest = { id: 7, email: 'guest@example.com', role: UserRole.CLIENT } as any;

    await expect(
      bookingService.createBooking(guest, {
        propertyId: 1,
        checkInDate,
        checkOutDate,
        guestsCount: 2,
      }),
    ).rejects.toThrow(HttpError);

    expect(mockBookingRepo.hardDeleteById).toHaveBeenCalledWith(99);
  });

  it('issues 100% refund when host cancels a confirmed paid booking', async () => {
    mockBookingRepo.findById.mockResolvedValue({
      id: 50,
      propertyId: 1,
      guestId: 7,
      hostId: 2,
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      checkInDate: dayjs().add(2, 'day').format('YYYY-MM-DD'),
      checkOutDate: dayjs().add(5, 'day').format('YYYY-MM-DD'),
      nightsSubtotal: 60000,
      cleaningFee: 5000,
      totalPrice: 65000,
      cancellationPolicy: CancellationPolicy.STRICT,
      stripePaymentIntentId: 'pi_12345',
    });
    mockPropertyRepo.findById.mockResolvedValue({
      id: 1,
      checkInTime: '15:00',
    });
    mockStripeService.refundPayment.mockResolvedValue('re_full_123');
    mockBookingRepo.updateAndFetchById.mockImplementation(async ({ data }: any) => ({
      id: 50,
      ...data,
    }));

    const result = await bookingService.cancelBookingByActor({
      bookingId: 50,
      userId: 2, // Host ID
      userRole: UserRole.HOST,
      data: { reason: 'Plumbing issue' },
    });

    expect(mockStripeService.refundPayment).toHaveBeenCalledWith({
      paymentIntentId: 'pi_12345',
      amount: 65000,
      isFullRefund: true,
      bookingId: 50,
    });
    expect(result.status).toBe(BookingStatus.CANCELLED);
    expect(result.paymentStatus).toBe(PaymentStatus.REFUNDED);
    expect(result.refundedAmount).toBe(65000);
  });

  it('calculates partial refund (only cleaning fee) when guest cancels a STRICT booking less than 7 days before check-in', async () => {
    mockBookingRepo.findById.mockResolvedValue({
      id: 51,
      propertyId: 1,
      guestId: 7,
      hostId: 2,
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
      checkInDate: dayjs().add(3, 'day').format('YYYY-MM-DD'),
      checkOutDate: dayjs().add(6, 'day').format('YYYY-MM-DD'),
      nightsSubtotal: 60000,
      cleaningFee: 5000,
      totalPrice: 65000,
      cancellationPolicy: CancellationPolicy.STRICT,
      stripePaymentIntentId: 'pi_strict_123',
    });
    mockPropertyRepo.findById.mockResolvedValue({
      id: 1,
      checkInTime: '15:00',
    });
    mockStripeService.refundPayment.mockResolvedValue('re_partial_123');
    mockBookingRepo.updateAndFetchById.mockImplementation(async ({ data }: any) => ({
      id: 51,
      ...data,
    }));

    const result = await bookingService.cancelBookingByActor({
      bookingId: 51,
      userId: 7, // Guest ID
      userRole: UserRole.CLIENT,
      data: { reason: 'Change of plans' },
    });

    expect(mockStripeService.refundPayment).toHaveBeenCalledWith({
      paymentIntentId: 'pi_strict_123',
      amount: 5000, // Only cleaning fee
      isFullRefund: false,
      bookingId: 51,
    });
    expect(result.paymentStatus).toBe(PaymentStatus.PARTIALLY_REFUNDED);
    expect(result.refundedAmount).toBe(5000);
  });
});
