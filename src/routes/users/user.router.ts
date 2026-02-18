import { Router } from 'express';

import { ErrorCodes } from '@lib/constants/errors.js';
import { RequestConfig } from '@lib/constants/limits.js';
import { createRateLimiter } from '@lib/middlewares/rate-limit.middleware.js';

import { UserController } from './user.controller.js';

const ProtectedUserRoutes = {
  ME: '/me',
} as const;

const AdminUserRoutes = {
  ROOT: '/',
  BY_ID: '/:id',
} as const;

export function createProtectedUserRouter(): Router {
  const router = Router({ mergeParams: true });
  const userController = ioc.get(UserController);

  router.get(ProtectedUserRoutes.ME, userController.getMe);

  router.patch(ProtectedUserRoutes.ME, userController.updateMe);

  router.delete(
    ProtectedUserRoutes.ME,
    createRateLimiter({
      windowMs: RequestConfig.RATE_LIMIT.STRICT.WINDOW_MS,
      max: RequestConfig.RATE_LIMIT.STRICT.MAX_REQUESTS,
      errorCode: ErrorCodes.TOO_MANY_STRICT_REQUESTS,
      message: 'Too many account deletion attempts. Please try again in an hour',
    }),
    userController.deleteMe,
  );

  return router;
}

export function createAdminUserRouter(): Router {
  const router = Router({ mergeParams: true });
  const userController = ioc.get(UserController);

  router.get(AdminUserRoutes.ROOT, userController.getAllUsers);

  router.get(AdminUserRoutes.BY_ID, userController.getUserById);

  router.patch(AdminUserRoutes.BY_ID, userController.updateUser);

  router.delete(AdminUserRoutes.BY_ID, userController.deleteUser);

  return router;
}
