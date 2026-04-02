import { Router } from 'express';

import { RateLimiters } from '@lib/middlewares/rate-limit/rate-limiters.js';
import { skipIfParamNotNumericMiddleware } from '@lib/middlewares/skip-if-param-not-numeric.middleware.js';

import { PropertyController } from './property.controller.js';

const PublicPropertyRoutes = {
  ROOT: '/',
  BY_ID: '/:id',
} as const;

const ProtectedPropertyRoutes = {
  ROOT: '/',
  ME: '/me',
  BY_ID: '/:id',
  PUBLISH: '/:id/publish',
  PAUSE: '/:id/pause',
  UNPAUSE: '/:id/unpause',
} as const;

const AdminPropertyRoutes = {
  ROOT: '/',
  BY_ID: '/:id',
} as const;

export function createPublicPropertyRouter(): Router {
  const router = Router({ mergeParams: true });
  const propertyController = ioc.get(PropertyController);

  router.get(
    PublicPropertyRoutes.ROOT,
    RateLimiters.PROPERTIES.SEARCH,
    propertyController.getAllPublicProperties,
  );

  router.get(
    PublicPropertyRoutes.BY_ID,
    skipIfParamNotNumericMiddleware('id'),
    propertyController.getPublicPropertyById,
  );

  return router;
}

export function createProtectedPropertyRouter(): Router {
  const router = Router({ mergeParams: true });
  const propertyController = ioc.get(PropertyController);

  router.post(
    ProtectedPropertyRoutes.ROOT,
    RateLimiters.PROPERTIES.CREATION,
    propertyController.createMyProperty,
  );

  router.get(ProtectedPropertyRoutes.ME, propertyController.getMyProperties);

  router.patch(
    ProtectedPropertyRoutes.BY_ID,
    RateLimiters.PROPERTIES.UPDATE,
    propertyController.updateMyProperty,
  );

  router.post(
    ProtectedPropertyRoutes.PUBLISH,
    RateLimiters.PROPERTIES.PUBLISH,
    propertyController.publishMyProperty,
  );

  router.post(
    ProtectedPropertyRoutes.PAUSE,
    RateLimiters.PROPERTIES.STATUS_CHANGE,
    propertyController.pauseMyProperty,
  );

  router.post(
    ProtectedPropertyRoutes.UNPAUSE,
    RateLimiters.PROPERTIES.STATUS_CHANGE,
    propertyController.unpauseMyProperty,
  );

  router.delete(ProtectedPropertyRoutes.BY_ID, propertyController.deleteMyProperty);

  return router;
}

export function createAdminPropertyRouter(): Router {
  const router = Router({ mergeParams: true });
  const propertyController = ioc.get(PropertyController);

  router.get(AdminPropertyRoutes.ROOT, propertyController.adminGetAllProperties);
  router.patch(AdminPropertyRoutes.BY_ID, propertyController.adminUpdateProperty);
  router.delete(AdminPropertyRoutes.BY_ID, propertyController.adminDeleteProperty);

  return router;
}
