import { Router } from 'express';

import { RateLimiters } from '@lib/middlewares/rate-limit/rate-limiters.js';
import { skipIfParamNotNumericMiddleware } from '@lib/middlewares/skip-if-param-not-numeric.middleware.js';

import { AmenityController } from './amenity.controller.js';

const PublicAmenityRoutes = {
  AMENITIES_ROOT: '/',
  AMENITY_BY_ID: '/:id',
  AMENITY_CATEGORIES_ROOT: '/categories',
  AMENITY_CATEGORY_BY_ID: '/categories/:id',
} as const;

const AdminAmenityRoutes = {
  AMENITIES_ROOT: '/',
  AMENITY_BY_ID: '/:id',
  AMENITY_CATEGORIES_ROOT: '/categories',
  AMENITY_CATEGORY_BY_ID: '/categories/:id',
} as const;

export function createPublicAmenityRouter(): Router {
  const router = Router({ mergeParams: true });
  const amenityController = ioc.get(AmenityController);

  // --- AMENITIES ---
  router.get(
    PublicAmenityRoutes.AMENITIES_ROOT,
    RateLimiters.AMENITIES.SEARCH,
    amenityController.getAmenities,
  );

  router.get(
    PublicAmenityRoutes.AMENITY_BY_ID,
    skipIfParamNotNumericMiddleware('id'),
    amenityController.getAmenityById,
  );

  // --- AMENITY CATEGORIES ---
  router.get(
    PublicAmenityRoutes.AMENITY_CATEGORIES_ROOT,
    RateLimiters.AMENITIES.SEARCH,
    amenityController.getAmenityCategories,
  );

  router.get(
    PublicAmenityRoutes.AMENITY_CATEGORY_BY_ID,
    skipIfParamNotNumericMiddleware('id'),
    amenityController.getAmenityCategoryById,
  );

  return router;
}

export function createAdminAmenityRouter(): Router {
  const router = Router({ mergeParams: true });
  const amenityController = ioc.get(AmenityController);

  // --- AMENITIES ---
  router.post(
    AdminAmenityRoutes.AMENITIES_ROOT,
    RateLimiters.AMENITIES.MANAGEMENT,
    amenityController.adminCreateAmenity,
  );

  router.patch(
    AdminAmenityRoutes.AMENITY_BY_ID,
    RateLimiters.AMENITIES.MANAGEMENT,
    amenityController.adminUpdateAmenity,
  );

  router.delete(
    AdminAmenityRoutes.AMENITY_BY_ID,
    RateLimiters.AMENITIES.MANAGEMENT,
    amenityController.adminDeleteAmenity,
  );

  // --- AMENITY CATEGORIES ---
  router.post(
    AdminAmenityRoutes.AMENITY_CATEGORIES_ROOT,
    RateLimiters.AMENITIES.MANAGEMENT,
    amenityController.adminCreateAmenityCategory,
  );

  router.patch(
    AdminAmenityRoutes.AMENITY_CATEGORY_BY_ID,
    RateLimiters.AMENITIES.MANAGEMENT,
    amenityController.adminUpdateAmenityCategory,
  );

  router.delete(
    AdminAmenityRoutes.AMENITY_CATEGORY_BY_ID,
    RateLimiters.AMENITIES.MANAGEMENT,
    amenityController.adminDeleteAmenityCategory,
  );

  return router;
}
