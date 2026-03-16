import { Router } from 'express';

import { ApiRoutes } from '@lib/constants/routes.js';
import { authMiddleware } from '@lib/middlewares/auth.middleware.js';

import { createAdminRouter } from './admin.routes.js';
import { createPublicAuthRouter } from './auth/auth.router.js';
import { createProtectedUserRouter } from './users/user.router.js';

export function createV1Router(): Router {
  const router = Router();

  // --- PUBLIC / SEMI-PUBLIC ROUTES ---
  router.use(ApiRoutes.AUTH, createPublicAuthRouter());

  // --- GLOBAL BARRIER ---
  router.use(authMiddleware());

  // --- PROTECTED ROUTES ---
  router.use(ApiRoutes.USERS, createProtectedUserRouter());

  // --- ADMIN ROUTES ---
  router.use(ApiRoutes.ADMIN, createAdminRouter());

  return router;
}
