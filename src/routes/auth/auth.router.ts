import { Router } from 'express';

import { RateLimiters } from '@lib/middlewares/rate-limit/rate-limiters.js';
import { checkJwt } from '@utils/jwt.js';

import { AuthController } from './auth.controller.js';

const PublicAuthRoutes = {
  LOGIN: '/login',
} as const;

export function createPublicAuthRouter(): Router {
  const router = Router({ mergeParams: true });
  const authController = ioc.get(AuthController);

  router.post(PublicAuthRoutes.LOGIN, checkJwt, RateLimiters.AUTH.LOGIN, authController.login);

  return router;
}
