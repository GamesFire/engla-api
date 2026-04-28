import { Router } from 'express';

import { RateLimiters } from '@lib/middlewares/rate-limit/rate-limiters.js';
import { uploadAvatarMiddleware } from '@lib/middlewares/upload.middleware.js';

import { UserController } from './user.controller.js';

const ProtectedUserRoutes = {
  ME: '/me',
  AVATAR: '/me/avatar',
} as const;

const AdminUserRoutes = {
  ROOT: '/',
  BY_ID: '/:id',
} as const;

export function createProtectedUserRouter(): Router {
  const router = Router({ mergeParams: true });
  const userController = ioc.get(UserController);

  router.get(ProtectedUserRoutes.ME, userController.getMe);
  router.patch(ProtectedUserRoutes.ME, RateLimiters.USERS.UPDATE, userController.updateMe);

  router.put(
    ProtectedUserRoutes.AVATAR,
    RateLimiters.USERS.UPLOAD_AVATAR,
    uploadAvatarMiddleware,
    userController.uploadMyAvatar,
  );

  router.delete(ProtectedUserRoutes.ME, RateLimiters.USERS.DELETION, userController.deleteMe);

  return router;
}

export function createAdminUserRouter(): Router {
  const router = Router({ mergeParams: true });
  const userController = ioc.get(UserController);

  router.get(AdminUserRoutes.ROOT, userController.adminGetAllUsers);
  router.get(AdminUserRoutes.BY_ID, userController.adminGetUserById);
  router.patch(AdminUserRoutes.BY_ID, userController.adminUpdateUser);
  router.delete(AdminUserRoutes.BY_ID, userController.adminDeleteUser);

  return router;
}
