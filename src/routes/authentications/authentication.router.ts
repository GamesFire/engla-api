import { Router } from 'express';

import { validateRequest } from '@lib/middlewares/validate-request.middleware.js';
import { checkJwt } from '@utils/jwt.js';

import { AuthenticationController } from './authentication.controller.js';
import { loginBodySchema } from './authentication.validation.js';

const PublicAuthenticationRoutes = {
  LOGIN: '/login',
} as const;

export function createPublicAuthenticationRouter(): Router {
  const router = Router({ mergeParams: true });
  const authenticationController = ioc.get(AuthenticationController);

  router.post(
    PublicAuthenticationRoutes.LOGIN,
    checkJwt,
    validateRequest({ body: loginBodySchema }),
    authenticationController.login,
  );

  return router;
}
