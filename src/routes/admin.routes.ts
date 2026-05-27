import { Router } from 'express';

import { ApiRoutes } from '@lib/constants/routes.js';
import { roleMiddleware } from '@lib/middlewares/role.middleware.js';
import { UserRole } from '@models/users/user.model.js';

import { createAdminAmenityRouter } from './amenities/amenity.routes.js';
import { createAdminPermissionRouter } from './permissions/permission.routes.js';
import { createAdminPropertyRouter } from './properties/property.routes.js';
import { createAdminUserRouter } from './users/user.routes.js';

export function createAdminRouter(): Router {
  const router = Router();

  // --- ADMIN BARRIER ---
  router.use(roleMiddleware([UserRole.ADMIN]));

  // --- ADMIN ROUTES ---
  router.use(ApiRoutes.USERS, createAdminUserRouter());
  router.use(ApiRoutes.PROPERTIES, createAdminPropertyRouter());
  router.use(ApiRoutes.AMENITIES, createAdminAmenityRouter());
  router.use(ApiRoutes.PERMISSIONS, createAdminPermissionRouter());

  return router;
}
