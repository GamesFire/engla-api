/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import { BookingController } from '@routes/bookings/booking.controller.js';

describe('BookingController', () => {
  it('should throw ZodError if createMyBooking payload is invalid', async () => {
    const mockBookingService = { createBooking: vi.fn() } as any;
    const controller = new BookingController(mockBookingService);

    const req = {
      currentUser: { id: 7, role: 'client' },
      body: { propertyId: -1, checkInDate: 'invalid', checkOutDate: 'invalid', guestsCount: 0 },
    } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    await expect(controller.createMyBooking(req, res)).rejects.toThrow(ZodError);
    expect(mockBookingService.createBooking).not.toHaveBeenCalled();
  });

  it('should call BookingService.createBooking and return 201 on valid payload', async () => {
    const mockResult = { booking: { id: 1 }, checkoutUrl: 'https://checkout.stripe.com/test' };
    const mockBookingService = {
      createBooking: vi.fn().mockResolvedValue(mockResult),
    } as any;
    const controller = new BookingController(mockBookingService);

    const checkInDate = dayjs().add(3, 'day').format('YYYY-MM-DD');
    const checkOutDate = dayjs().add(6, 'day').format('YYYY-MM-DD');
    const user = { id: 7, email: 'guest@example.com', role: 'client' };

    const req = {
      currentUser: user,
      body: {
        propertyId: 1,
        checkInDate,
        checkOutDate,
        guestsCount: 2,
      },
    } as any;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

    await controller.createMyBooking(req, res);

    expect(mockBookingService.createBooking).toHaveBeenCalledWith(
      user,
      expect.objectContaining({
        propertyId: 1,
        checkInDate,
        checkOutDate,
        guestsCount: 2,
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });
});
