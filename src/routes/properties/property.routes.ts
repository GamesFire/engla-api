import { Router } from 'express';

import { permissionMiddleware } from '@lib/middlewares/permission.middleware.js';
import { RateLimiters } from '@lib/middlewares/rate-limit/rate-limiters.js';
import { skipIfParamNotNumericMiddleware } from '@lib/middlewares/skip-if-param-not-numeric.middleware.js';
import { uploadPropertyImagesMiddleware } from '@lib/middlewares/upload.middleware.js';
import { SystemPermission } from '@models/permission.model.js';

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
  IMAGES: '/:id/images',
  IMAGES_REORDER: '/:id/images/reorder',
  IMAGE_BY_ID: '/:id/images/:imageId',
  MAKE_IMAGE_MAIN: '/:id/images/:imageId/main',
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

  router.post(
    ProtectedPropertyRoutes.IMAGES,
    RateLimiters.PROPERTIES.UPLOAD_IMAGES,
    uploadPropertyImagesMiddleware,
    propertyController.uploadMyPropertyImages,
  );

  router.patch(
    ProtectedPropertyRoutes.IMAGES_REORDER,
    RateLimiters.PROPERTIES.MANAGE_IMAGES,
    propertyController.reorderMyPropertyImages,
  );

  router.delete(
    ProtectedPropertyRoutes.IMAGE_BY_ID,
    RateLimiters.PROPERTIES.MANAGE_IMAGES,
    propertyController.deleteMyPropertyImage,
  );

  router.put(
    ProtectedPropertyRoutes.MAKE_IMAGE_MAIN,
    RateLimiters.PROPERTIES.MANAGE_IMAGES,
    propertyController.setMainMyPropertyImage,
  );

  return router;
}

export function createAdminPropertyRouter(): Router {
  const router = Router({ mergeParams: true });
  const propertyController = ioc.get(PropertyController);

  router.get(
    AdminPropertyRoutes.ROOT,
    permissionMiddleware([SystemPermission.PROPERTIES_READ]),
    propertyController.adminGetAllProperties,
  );

  router.patch(
    AdminPropertyRoutes.BY_ID,
    RateLimiters.ADMIN.MANAGEMENT,
    permissionMiddleware([SystemPermission.PROPERTIES_UPDATE]),
    propertyController.adminUpdateProperty,
  );

  router.delete(
    AdminPropertyRoutes.BY_ID,
    RateLimiters.ADMIN.MANAGEMENT,
    permissionMiddleware([SystemPermission.PROPERTIES_DELETE]),
    propertyController.adminDeleteProperty,
  );

  return router;
}
