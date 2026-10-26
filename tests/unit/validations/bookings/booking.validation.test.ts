import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import {
  adminCancelBookingBodySchema,
  cancelBookingBodySchema,
  createBookingBodySchema,
} from '@routes/bookings/booking.validation.js';

describe('Booking Validations', () => {
  const futureCheckIn = dayjs().add(5, 'day').format('YYYY-MM-DD');
  const futureCheckOut = dayjs().add(10, 'day').format('YYYY-MM-DD');

  describe('createBookingBodySchema', () => {
    it('parses a valid booking creation payload and sanitizes specialRequests', () => {
      const payload = {
        propertyId: 1,
        checkInDate: futureCheckIn,
        checkOutDate: futureCheckOut,
        guestsCount: 2,
        specialRequests: '  <b>Late check-in</b> please  ',
      };

      const parsed = createBookingBodySchema.parse(payload);

      expect(parsed.propertyId).toBe(1);
      expect(parsed.checkInDate).toBe(futureCheckIn);
      expect(parsed.checkOutDate).toBe(futureCheckOut);
      expect(parsed.guestsCount).toBe(2);
      expect(parsed.specialRequests).toBe('Late check-in please');
    });

    it('rejects check-in dates in the past', () => {
      const pastDate = dayjs().subtract(2, 'day').format('YYYY-MM-DD');

      expect(() =>
        createBookingBodySchema.parse({
          propertyId: 1,
          checkInDate: pastDate,
          checkOutDate: futureCheckOut,
          guestsCount: 2,
        }),
      ).toThrow();
    });

    it('rejects check-out date equal to or before check-in date', () => {
      expect(() =>
        createBookingBodySchema.parse({
          propertyId: 1,
          checkInDate: futureCheckIn,
          checkOutDate: futureCheckIn,
          guestsCount: 2,
        }),
      ).toThrow();
    });

    it('rejects stay durations exceeding 31 nights', () => {
      const tooLongCheckOut = dayjs(futureCheckIn).add(32, 'day').format('YYYY-MM-DD');

      expect(() =>
        createBookingBodySchema.parse({
          propertyId: 1,
          checkInDate: futureCheckIn,
          checkOutDate: tooLongCheckOut,
          guestsCount: 2,
        }),
      ).toThrow();
    });

    it('rejects invalid calendar dates like 2026-02-31', () => {
      expect(() =>
        createBookingBodySchema.parse({
          propertyId: 1,
          checkInDate: '2026-02-31',
          checkOutDate: '2026-03-05',
          guestsCount: 1,
        }),
      ).toThrow();
    });
  });

  describe('cancelBookingBodySchema & adminCancelBookingBodySchema', () => {
    it('allows optional reason for user cancellation', () => {
      const parsed = cancelBookingBodySchema.parse({});
      expect(parsed.reason).toBeUndefined();
    });

    it('requires a valid reason for admin cancellation', () => {
      expect(() => adminCancelBookingBodySchema.parse({})).toThrow();

      const parsed = adminCancelBookingBodySchema.parse({
        reason: '  <script>alert(1)</script>Emergency property maintenance required  ',
      });
      expect(parsed.reason).toBe('Emergency property maintenance required');
    });
  });
});
