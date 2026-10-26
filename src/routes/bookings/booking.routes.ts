import { Router } from 'express';

import { permissionMiddleware } from '@lib/middlewares/permission.middleware.js';
import { RateLimiters } from '@lib/middlewares/rate-limit/rate-limiters.js';
import { roleMiddleware } from '@lib/middlewares/role.middleware.js';
import { skipIfParamNotNumericMiddleware } from '@lib/middlewares/skip-if-param-not-numeric.middleware.js';
import { SystemPermission } from '@models/permission.model.js';
import { UserRole } from '@models/users/user.model.js';

import { BookingController } from './booking.controller.js';

const ProtectedBookingRoutes = {
  ROOT: '/',
  ME: '/me',
  HOSTING: '/hosting',
  BY_ID: '/:id',
  PAY: '/:id/pay',
  CANCEL: '/:id/cancel',
} as const;

const AdminBookingRoutes = {
  ROOT: '/',
  BY_ID: '/:id',
  CANCEL: '/:id/cancel',
} as const;

export function createProtectedBookingRouter(): Router {
  const router = Router({ mergeParams: true });
  const bookingController = ioc.get(BookingController);

  router.get(
    ProtectedBookingRoutes.ME,
    RateLimiters.BOOKINGS.SEARCH,
    bookingController.getMyBookings,
  );

  router.get(
    ProtectedBookingRoutes.HOSTING,
    roleMiddleware([UserRole.HOST, UserRole.ADMIN]),
    RateLimiters.BOOKINGS.SEARCH,
    bookingController.getMyHostedBookings,
  );

  router.post(
    ProtectedBookingRoutes.ROOT,
    RateLimiters.BOOKINGS.CREATION,
    bookingController.createMyBooking,
  );

  router.get(
    ProtectedBookingRoutes.BY_ID,
    skipIfParamNotNumericMiddleware('id'),
    bookingController.getMyBookingById,
  );

  router.post(
    ProtectedBookingRoutes.PAY,
    RateLimiters.BOOKINGS.PAYMENT,
    bookingController.createMyBookingPaymentSession,
  );

  router.post(
    ProtectedBookingRoutes.CANCEL,
    RateLimiters.BOOKINGS.CANCELLATION,
    bookingController.cancelMyBooking,
  );

  return router;
}

export function createAdminBookingRouter(): Router {
  const router = Router({ mergeParams: true });
  const bookingController = ioc.get(BookingController);

  router.get(
    AdminBookingRoutes.ROOT,
    permissionMiddleware([SystemPermission.BOOKINGS_READ]),
    bookingController.adminGetBookings,
  );

  router.get(
    AdminBookingRoutes.BY_ID,
    skipIfParamNotNumericMiddleware('id'),
    permissionMiddleware([SystemPermission.BOOKINGS_READ]),
    bookingController.adminGetBookingById,
  );

  router.post(
    AdminBookingRoutes.CANCEL,
    RateLimiters.ADMIN.MANAGEMENT,
    permissionMiddleware([SystemPermission.BOOKINGS_UPDATE]),
    bookingController.adminCancelBooking,
  );

  return router;
}
