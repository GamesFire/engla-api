import { Router } from 'express';

import { permissionMiddleware } from '@lib/middlewares/permission.middleware.js';
import { SystemPermission } from '@models/permission.model.js';

import { PermissionController } from './permission.controller.js';

const AdminPermissionRoutes = {
  ROOT: '/',
} as const;

export function createAdminPermissionRouter(): Router {
  const router = Router({ mergeParams: true });
  const permissionController = ioc.get(PermissionController);

  router.get(
    AdminPermissionRoutes.ROOT,
    permissionMiddleware([SystemPermission.SYSTEM_PERMISSIONS]),
    permissionController.adminGetAllPermissions,
  );

  return router;
}
