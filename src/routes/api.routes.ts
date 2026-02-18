import { Router } from 'express';

import { ApiRoutes } from '@lib/constants/routes.js';
import { authMiddleware } from '@lib/middlewares/auth.middleware.js';
import { roleMiddleware } from '@lib/middlewares/role.middleware.js';
import { UserRole } from '@models/users/user.model.js';

import { createPublicAuthRouter } from './auth/auth.router.js';
import { createAdminUserRouter, createProtectedUserRouter } from './users/user.router.js';

export function createV1Router(): Router {
  const router = Router();

  // --- PUBLIC / SEMI-PUBLIC ROUTES ---
  router.use(ApiRoutes.AUTH, createPublicAuthRouter());

  // --- GLOBAL BARRIER ---
  router.use(authMiddleware());

  // --- PROTECTED ROUTES ---
  router.use(ApiRoutes.USERS, createProtectedUserRouter());

  // --- ADMIN BARRIER ---
  const adminRouter = Router();
  adminRouter.use(roleMiddleware([UserRole.ADMIN]));

  // --- ADMIN ROUTES ---
  adminRouter.use(ApiRoutes.USERS, createAdminUserRouter());

  router.use(ApiRoutes.ADMIN, adminRouter);

  return router;
}
