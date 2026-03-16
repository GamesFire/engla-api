import { Router } from 'express';

import { checkJwt } from '@utils/jwt.js';

import { AuthController } from './auth.controller.js';

const PublicAuthRoutes = {
  LOGIN: '/login',
} as const;

export function createPublicAuthRouter(): Router {
  const router = Router({ mergeParams: true });
  const authController = ioc.get(AuthController);

  router.post(PublicAuthRoutes.LOGIN, checkJwt, authController.login);

  return router;
}
