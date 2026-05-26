import { Router } from 'express';

import { permissionMiddleware } from '@lib/middlewares/permission.middleware.js';
import { RateLimiters } from '@lib/middlewares/rate-limit/rate-limiters.js';
import { uploadAvatarMiddleware } from '@lib/middlewares/upload.middleware.js';
import { SystemPermission } from '@models/permission.model.js';

import { UserController } from './user.controller.js';

const ProtectedUserRoutes = {
  ME: '/me',
  AVATAR: '/me/avatar',
} as const;

const AdminUserRoutes = {
  ROOT: '/',
  BY_ID: '/:id',
  PERMISSIONS: '/:id/permissions',
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

  router.get(
    AdminUserRoutes.ROOT,
    permissionMiddleware([SystemPermission.USERS_READ]),
    userController.adminGetUsers,
  );

  router.get(
    AdminUserRoutes.BY_ID,
    permissionMiddleware([SystemPermission.USERS_READ]),
    userController.adminGetUserById,
  );

  router.get(
    AdminUserRoutes.PERMISSIONS,
    permissionMiddleware([SystemPermission.SYSTEM_PERMISSIONS]),
    userController.adminGetUserPermissions,
  );

  router.patch(
    AdminUserRoutes.BY_ID,
    RateLimiters.ADMIN.MANAGEMENT,
    permissionMiddleware([SystemPermission.USERS_UPDATE]),
    userController.adminUpdateUser,
  );

  router.delete(
    AdminUserRoutes.BY_ID,
    RateLimiters.ADMIN.MANAGEMENT,
    permissionMiddleware([SystemPermission.USERS_DELETE]),
    userController.adminDeleteUser,
  );

  router.put(
    AdminUserRoutes.PERMISSIONS,
    RateLimiters.ADMIN.MANAGEMENT,
    permissionMiddleware([SystemPermission.SYSTEM_PERMISSIONS]),
    userController.adminSyncUserPermissions,
  );

  return router;
}
