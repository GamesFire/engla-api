import { Router } from 'express';

import { ApiRoutes } from '@lib/constants/routes.js';
import { authMiddleware } from '@lib/middlewares/auth.middleware.js';
import { roleMiddleware } from '@lib/middlewares/role.middleware.js';
import { UserRole } from '@models/users/user.model.js';

import { createAdminRouter } from './admin.routes.js';
import { createPublicAmenityRouter } from './amenities/amenity.routes.js';
import { createPublicAuthRouter } from './auth/auth.routes.js';
import {
  createProtectedPropertyRouter,
  createPublicPropertyRouter,
} from './properties/property.routes.js';
import { createProtectedUserRouter } from './users/user.routes.js';

export function createV1Router(): Router {
  const router = Router();

  // --- PUBLIC / SEMI-PUBLIC ROUTES ---
  router.use(ApiRoutes.AUTH, createPublicAuthRouter());
  router.use(ApiRoutes.PROPERTIES, createPublicPropertyRouter());
  router.use(ApiRoutes.AMENITIES, createPublicAmenityRouter());

  // --- GLOBAL BARRIER ---
  router.use(authMiddleware());

  // --- PROTECTED ROUTES ---
  router.use(ApiRoutes.USERS, createProtectedUserRouter());
  router.use(
    ApiRoutes.PROPERTIES,
    roleMiddleware([UserRole.HOST, UserRole.ADMIN]),
    createProtectedPropertyRouter(),
  );

  // --- ADMIN ROUTES ---
  router.use(ApiRoutes.ADMIN, createAdminRouter());

  return router;
}
