import type { Request, Response } from 'express';
import { inject } from 'inversify';

import { provide } from '@ioc/decorators.js';
import { BookingService } from '@modules/bookings/booking.service.js';

import {
  adminCancelBookingBodySchema,
  adminGetBookingsQuerySchema,
  bookingIdParamSchema,
  cancelBookingBodySchema,
  createBookingBodySchema,
  getHostedBookingsQuerySchema,
  getMyBookingsQuerySchema,
} from './booking.validation.js';

@provide()
export class BookingController {
  constructor(@inject(BookingService) private readonly _bookingService: BookingService) {
    this.getMyBookings = this.getMyBookings.bind(this);
    this.getMyHostedBookings = this.getMyHostedBookings.bind(this);
    this.createMyBooking = this.createMyBooking.bind(this);
    this.getMyBookingById = this.getMyBookingById.bind(this);
    this.createMyBookingPaymentSession = this.createMyBookingPaymentSession.bind(this);
    this.cancelMyBooking = this.cancelMyBooking.bind(this);

    this.adminGetBookings = this.adminGetBookings.bind(this);
    this.adminGetBookingById = this.adminGetBookingById.bind(this);
    this.adminCancelBooking = this.adminCancelBooking.bind(this);
  }

  // --- PROTECTED ENDPOINTS (Guests & Hosts) ---

  public async getMyBookings(req: Request, res: Response) {
    const user = req.currentUser!;
    const getMyBookingsQueryDto = getMyBookingsQuerySchema.parse(req.query);

    const bookings = await this._bookingService.getBookingsByGuestId(
      user.id,
      getMyBookingsQueryDto,
    );

    res.status(200).json(bookings);
  }

  public async getMyHostedBookings(req: Request, res: Response) {
    const user = req.currentUser!;
    const getHostedBookingsQueryDto = getHostedBookingsQuerySchema.parse(req.query);

    const bookings = await this._bookingService.getBookingsByHostId(
      user.id,
      getHostedBookingsQueryDto,
    );

    res.status(200).json(bookings);
  }

  public async createMyBooking(req: Request, res: Response) {
    const user = req.currentUser!;
    const createBookingBodyDto = createBookingBodySchema.parse(req.body);

    const result = await this._bookingService.createBooking(user, createBookingBodyDto);

    res.status(201).json(result);
  }

  public async getMyBookingById(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: bookingId } = bookingIdParamSchema.parse(req.params);

    const booking = await this._bookingService.getBookingByIdForActor(bookingId, user.id);

    res.status(200).json(booking);
  }

  public async createMyBookingPaymentSession(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: bookingId } = bookingIdParamSchema.parse(req.params);

    const result = await this._bookingService.createPaymentSessionForBooking(user, bookingId);

    res.status(200).json(result);
  }

  public async cancelMyBooking(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: bookingId } = bookingIdParamSchema.parse(req.params);
    const cancelBookingBodyDto = cancelBookingBodySchema.parse(req.body);

    const cancelledBooking = await this._bookingService.cancelBookingByActor({
      bookingId,
      userId: user.id,
      userRole: user.role,
      data: cancelBookingBodyDto,
    });

    res.status(200).json(cancelledBooking);
  }

  // --- ADMIN ENDPOINTS ---

  public async adminGetBookings(req: Request, res: Response) {
    const adminGetBookingsQueryDto = adminGetBookingsQuerySchema.parse(req.query);
    const bookings = await this._bookingService.getBookingsByAdmin(adminGetBookingsQueryDto);

    res.status(200).json(bookings);
  }

  public async adminGetBookingById(req: Request, res: Response) {
    const { id: bookingId } = bookingIdParamSchema.parse(req.params);
    const booking = await this._bookingService.getBookingByIdForAdmin(bookingId);

    res.status(200).json(booking);
  }

  public async adminCancelBooking(req: Request, res: Response) {
    const { id: bookingId } = bookingIdParamSchema.parse(req.params);
    const adminCancelBookingBodyDto = adminCancelBookingBodySchema.parse(req.body);

    const cancelledBooking = await this._bookingService.cancelBookingByAdmin({
      bookingId,
      data: adminCancelBookingBodyDto,
    });

    res.status(200).json(cancelledBooking);
  }
}
