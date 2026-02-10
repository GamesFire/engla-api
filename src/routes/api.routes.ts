import { Router } from 'express';

import { ApiRoutes } from '@lib/constants/routes.js';
import { authenticationMiddleware } from '@lib/middlewares/authentication.middleware.js';

import { createPublicAuthenticationRouter } from './authentications/authentication.router.js';

export function createV1Router(): Router {
  const router = Router();

  // --- PUBLIC / SEMI-PUBLIC ROUTES ---
  router.use(ApiRoutes.AUTHENTICATION, createPublicAuthenticationRouter());

  // --- GLOBAL BARRIER ---
  router.use(authenticationMiddleware());

  // --- PROTECTED ROUTES ---

  return router;
}
