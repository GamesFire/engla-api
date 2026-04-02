import { Router } from 'express';

import { ApiRoutes } from '@lib/constants/routes.js';
import { roleMiddleware } from '@lib/middlewares/role.middleware.js';
import { UserRole } from '@models/users/user.model.js';

import { createAdminPropertyRouter } from './properties/property.router.js';
import { createAdminUserRouter } from './users/user.router.js';

export function createAdminRouter(): Router {
  const router = Router();

  // --- ADMIN BARRIER ---
  router.use(roleMiddleware([UserRole.ADMIN]));

  // --- ADMIN ROUTES ---
  router.use(ApiRoutes.USERS, createAdminUserRouter());
  router.use(ApiRoutes.PROPERTIES, createAdminPropertyRouter());

  return router;
}
