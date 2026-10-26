import dayjs from 'dayjs';
import { type QueryBuilder } from 'objection';

import type { PaginatedResponse } from '@app/interfaces/pagination.interface.js';
import { provide } from '@ioc/decorators.js';
import { type Booking, BookingModel, BookingStatus } from '@models/bookings/booking.model.js';
import { BookingModifier } from '@models/bookings/booking.modifiers.js';
import { PropertyModel } from '@models/properties/property.model.js';
import { PropertyBlockedDateModel } from '@models/property-blocked-date.model.js';
import { skipUndefinedFields } from '@utils/data.js';

import { BookingTimeFrame } from './booking.constants.js';
import type {
  BookingQueryOptions,
  CheckBookingAvailabilityParams,
  CreateBookingData,
  FindBookingOptions,
  GetBookingsByAdminParams,
  GetGuestBookingsParams,
  GetHostBookingsParams,
  GetOccupyingBookingsRangeParams,
  OccupyingBookingDateRange,
  UpdateBookingParams,
} from './booking.types.js';

@provide()
export class BookingRepository {
  /**
   * Applies common query options for bookings.
   *
   * @param query - The query to modify.
   * @param options - The options to apply.
   */
  private _applyOptions<T>(
    query: QueryBuilder<BookingModel, T>,
    options: BookingQueryOptions = {},
  ): void {
    const modifiersToApply =
      options.modifiers === undefined ? BookingModifier.GUEST_VIEW : options.modifiers;

    if (modifiersToApply) {
      query.modify(modifiersToApply);
    }
  }

  /**
   * Applies filters for searching bookings across guest, host, and admin views.
   *
   * @param query - The query to modify.
   * @param filters - The filters to apply.
   */
  private _applyFilters(
    query: QueryBuilder<BookingModel, BookingModel[]>,
    filters: GetGuestBookingsParams | GetHostBookingsParams | GetBookingsByAdminParams,
  ): void {
    const { status, timeFrame, propertyId, from, to } = filters;
    const today = dayjs().format('YYYY-MM-DD');

    if (status) {
      query.where('bookings.status', status);
    }

    if (propertyId !== undefined) {
      query.where('bookings.propertyId', propertyId);
    }

    if (from) {
      query.where('bookings.checkOutDate', '>', from);
    }

    if (to) {
      query.where('bookings.checkInDate', '<', to);
    }

    if (timeFrame) {
      switch (timeFrame) {
        case BookingTimeFrame.UPCOMING: {
          query
            .whereIn('bookings.status', [BookingStatus.CONFIRMED, BookingStatus.PENDING])
            .where('bookings.checkInDate', '>', today);
          break;
        }
        case BookingTimeFrame.CURRENT: {
          query
            .where('bookings.status', BookingStatus.CONFIRMED)
            .where('bookings.checkInDate', '<=', today)
            .where('bookings.checkOutDate', '>=', today);
          break;
        }
        case BookingTimeFrame.PAST: {
          query.where((builder) => {
            builder.where('bookings.status', BookingStatus.COMPLETED).orWhere((sub) => {
              sub
                .where('bookings.status', BookingStatus.CONFIRMED)
                .where('bookings.checkOutDate', '<', today);
            });
          });
          break;
        }
        case BookingTimeFrame.CANCELLED: {
          query.whereIn('bookings.status', [BookingStatus.CANCELLED, BookingStatus.EXPIRED]);
          break;
        }
      }
    }

    if ('guestId' in filters && filters.guestId !== undefined) {
      query.where('bookings.guestId', filters.guestId);
    }

    if ('hostId' in filters && filters.hostId !== undefined) {
      query.where('bookings.hostId', filters.hostId);
    }

    if ('paymentStatus' in filters && filters.paymentStatus !== undefined) {
      query.where('bookings.paymentStatus', filters.paymentStatus);
    }
  }

  /**
   * Applies a reusable filter clause for active bookings that occupy calendar dates:
   * - Status is CONFIRMED, OR
   * - Status is PENDING and `expiresAt` is still in the future.
   *
   * @param builder - The query builder to apply the filter to.
   */
  private _whereOccupyingCalendar(builder: QueryBuilder<BookingModel, BookingModel[]>): void {
    const now = new Date();

    builder.where((sub) => {
      sub.where('bookings.status', BookingStatus.CONFIRMED).orWhere((pendingSub) => {
        pendingSub
          .where('bookings.status', BookingStatus.PENDING)
          .where('bookings.expiresAt', '>', now);
      });
    });
  }

  // --- READ METHODS ---

  public async findById(
    bookingId: number,
    options: FindBookingOptions = {},
  ): Promise<Undefinable<Booking>> {
    const query = BookingModel.query().findById(bookingId);

    this._applyOptions(query, options);

    return query;
  }

  public async findByCheckoutSessionId(
    stripeCheckoutSessionId: string,
    options: FindBookingOptions = {},
  ): Promise<Undefinable<Booking>> {
    const query = BookingModel.query().findOne({ stripeCheckoutSessionId });

    this._applyOptions(query, options);

    return query;
  }

  public async findByPaymentIntentId(
    stripePaymentIntentId: string,
    options: FindBookingOptions = {},
  ): Promise<Undefinable<Booking>> {
    const query = BookingModel.query().findOne({ stripePaymentIntentId });

    this._applyOptions(query, options);

    return query;
  }

  public async getBookingsByGuestId(
    guestId: number,
    params: GetGuestBookingsParams,
  ): Promise<PaginatedResponse<Booking>> {
    const { page, limit, orderBy, orderDirection } = params;

    const query = BookingModel.query().modify(BookingModifier.GUEST_VIEW);

    query.where('bookings.guestId', guestId);
    this._applyFilters(query, params);
    query.orderBy(`bookings.${orderBy}`, orderDirection);

    const { results, total } = await query.page(page - 1, limit);
    const paginatedBookings = { results, total };

    return paginatedBookings;
  }

  public async getBookingsByHostId(
    hostId: number,
    params: GetHostBookingsParams,
  ): Promise<PaginatedResponse<Booking>> {
    const { page, limit, orderBy, orderDirection } = params;

    const query = BookingModel.query().modify(BookingModifier.HOST_VIEW);

    query.where('bookings.hostId', hostId);
    this._applyFilters(query, params);
    query.orderBy(`bookings.${orderBy}`, orderDirection);

    const { results, total } = await query.page(page - 1, limit);
    const paginatedBookings = { results, total };

    return paginatedBookings;
  }

  public async getBookingsByAdmin(
    params: GetBookingsByAdminParams,
  ): Promise<PaginatedResponse<Booking>> {
    const { page, limit, orderBy, orderDirection } = params;

    const query = BookingModel.query().modify(BookingModifier.ADMIN_VIEW);

    this._applyFilters(query, params);
    query.orderBy(`bookings.${orderBy}`, orderDirection);

    const { results, total } = await query.page(page - 1, limit);
    const paginatedBookings = { results, total };

    return paginatedBookings;
  }

  public async hasOverlappingActiveBookings(
    params: CheckBookingAvailabilityParams,
  ): Promise<boolean> {
    const { propertyId, checkInDate, checkOutDate, trx } = params;

    const query = BookingModel.query(trx)
      .select('id')
      .where('bookings.propertyId', propertyId)
      .where('bookings.checkInDate', '<', checkOutDate)
      .where('bookings.checkOutDate', '>', checkInDate);

    this._whereOccupyingCalendar(query);

    const existing = await query.first();
    return Boolean(existing);
  }

  public async isPropertyAvailable(params: CheckBookingAvailabilityParams): Promise<boolean> {
    const { propertyId, checkInDate, checkOutDate, trx } = params;

    const hasBookingOverlap = await this.hasOverlappingActiveBookings(params);

    if (hasBookingOverlap) {
      return false;
    }

    const blockedOverlap = await PropertyBlockedDateModel.query(trx)
      .select('id')
      .where({ propertyId })
      .where('startDate', '<', checkOutDate)
      .where('endDate', '>', checkInDate)
      .first();

    return !blockedOverlap;
  }

  public async getOccupyingBookingsInDateRange(
    params: GetOccupyingBookingsRangeParams,
  ): Promise<OccupyingBookingDateRange[]> {
    const { propertyId, from, to } = params;

    const query = BookingModel.query()
      .select('checkInDate', 'checkOutDate')
      .where('bookings.propertyId', propertyId)
      .where('bookings.checkInDate', '<', to)
      .where('bookings.checkOutDate', '>', from)
      .orderBy('bookings.checkInDate', 'asc');

    this._whereOccupyingCalendar(query);

    return query;
  }

  public async hasActiveBookingsForProperty(propertyId: number): Promise<boolean> {
    const today = dayjs().format('YYYY-MM-DD');

    const query = BookingModel.query()
      .select('id')
      .where('bookings.propertyId', propertyId)
      .where('bookings.checkOutDate', '>=', today);

    this._whereOccupyingCalendar(query);

    const existing = await query.first();
    return Boolean(existing);
  }

  public async hasActiveBookingsForUser(userId: number): Promise<boolean> {
    const today = dayjs().format('YYYY-MM-DD');

    const query = BookingModel.query()
      .select('id')
      .where((builder) => {
        builder.where('bookings.guestId', userId).orWhere('bookings.hostId', userId);
      })
      .where('bookings.checkOutDate', '>=', today);

    this._whereOccupyingCalendar(query);

    const existing = await query.first();
    return Boolean(existing);
  }

  public async findExpiredPendingBookings(): Promise<Booking[]> {
    return BookingModel.query()
      .where('status', BookingStatus.PENDING)
      .whereNotNull('expiresAt')
      .where('expiresAt', '<=', new Date());
  }

  public async countActivePendingBookingsByGuestId(guestId: number): Promise<number> {
    const result = await BookingModel.query()
      .where('bookings.guestId', guestId)
      .where('bookings.status', BookingStatus.PENDING)
      .where('bookings.expiresAt', '>', new Date())
      .resultSize();

    return result;
  }

  // --- WRITE METHODS ---

  /**
   * Atomically locks the target property row (`FOR UPDATE`), verifies date availability,
   * and inserts a new PENDING booking inside a database transaction.
   * Prevents race conditions (double-booking) under concurrent requests.
   *
   * @param data - The booking creation payload.
   * @returns The created Booking model, or `null` if the dates were taken concurrently.
   */
  public async createPendingBookingAtomically(data: CreateBookingData): Promise<Nullable<Booking>> {
    const insertedId = await PropertyModel.transaction(async (trx) => {
      await PropertyModel.query(trx).findById(data.propertyId).forUpdate();

      const isAvailable = await this.isPropertyAvailable({
        propertyId: data.propertyId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        trx,
      });

      if (!isAvailable) {
        return null;
      }

      const inserted = await BookingModel.query(trx).insert(data);
      return inserted.id;
    });

    if (!insertedId) {
      return null;
    }

    const createdBooking = (await this.findById(insertedId, { modifiers: null })) ?? null;
    return createdBooking;
  }

  public async updateAndFetchById(params: UpdateBookingParams): Promise<Booking> {
    const { bookingId, data, options = {} } = params;
    const cleanData = skipUndefinedFields(data);

    await BookingModel.query().findById(bookingId).patch(cleanData);

    return this.findById(bookingId, options) as Promise<Booking>;
  }

  public async hardDeleteById(bookingId: number): Promise<void> {
    await BookingModel.query().deleteById(bookingId);
  }

  public async completePastConfirmedBookings(todayStr: string): Promise<number> {
    return BookingModel.query()
      .where('status', BookingStatus.CONFIRMED)
      .where('checkOutDate', '<', todayStr)
      .patch({
        status: BookingStatus.COMPLETED,
        completedAt: new Date(),
      });
  }
}
