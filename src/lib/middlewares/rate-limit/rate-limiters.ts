import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { RequestConfig } from '@lib/constants/limits.js';

import { rateLimitMiddleware } from './rate-limit.middleware.js';

export const RateLimiters = {
  GLOBAL: rateLimitMiddleware({
    windowMs: RequestConfig.RATE_LIMIT.GLOBAL.WINDOW_MS,
    maxRequests: RequestConfig.RATE_LIMIT.GLOBAL.MAX_REQUESTS,
  }),
  ADMIN: {
    MANAGEMENT: rateLimitMiddleware({
      windowMs: RequestConfig.RATE_LIMIT.ADMIN.MANAGEMENT.WINDOW_MS,
      maxRequests: RequestConfig.RATE_LIMIT.ADMIN.MANAGEMENT.MAX_REQUESTS,
      errorCode: ErrorCodes.RATE_LIMIT.STRICT,
      message: ErrorMessages.RATE_LIMIT.ADMIN_MANAGEMENT,
    }),
  },
  AUTH: {
    LOGIN: rateLimitMiddleware({
      windowMs: RequestConfig.RATE_LIMIT.AUTH.LOGIN.WINDOW_MS,
      maxRequests: RequestConfig.RATE_LIMIT.AUTH.LOGIN.MAX_REQUESTS,
      errorCode: ErrorCodes.RATE_LIMIT.STRICT,
      message: ErrorMessages.RATE_LIMIT.AUTH_LOGIN,
      skipSuccessfulRequests: true,
    }),
  },
  WEBHOOKS: {
    STRIPE: rateLimitMiddleware({
      windowMs: RequestConfig.RATE_LIMIT.WEBHOOKS.STRIPE.WINDOW_MS,
      maxRequests: RequestConfig.RATE_LIMIT.WEBHOOKS.STRIPE.MAX_REQUESTS,
      errorCode: ErrorCodes.RATE_LIMIT.STRICT,
      message: ErrorMessages.RATE_LIMIT.WEBHOOK_STRIPE,
    }),
  },
  USERS: {
    UPDATE: rateLimitMiddleware({
      windowMs: RequestConfig.RATE_LIMIT.USERS.UPDATE.WINDOW_MS,
      maxRequests: RequestConfig.RATE_LIMIT.USERS.UPDATE.MAX_REQUESTS,
      errorCode: ErrorCodes.RATE_LIMIT.STRICT,
      message: ErrorMessages.RATE_LIMIT.USER_UPDATE,
    }),
    UPLOAD_AVATAR: rateLimitMiddleware({
      windowMs: RequestConfig.RATE_LIMIT.USERS.UPLOAD_AVATAR.WINDOW_MS,
      maxRequests: RequestConfig.RATE_LIMIT.USERS.UPLOAD_AVATAR.MAX_REQUESTS,
      errorCode: ErrorCodes.RATE_LIMIT.STRICT,
      message: ErrorMessages.RATE_LIMIT.USER_AVATAR_UPLOAD,
    }),
    DELETION: rateLimitMiddleware({
      windowMs: RequestConfig.RATE_LIMIT.USERS.DELETION.WINDOW_MS,
      maxRequests: RequestConfig.RATE_LIMIT.USERS.DELETION.MAX_REQUESTS,
      errorCode: ErrorCodes.RATE_LIMIT.STRICT,
      message: ErrorMessages.RATE_LIMIT.USER_DELETION,
    }),
    ONBOARDING: rateLimitMiddleware({
      windowMs: RequestConfig.RATE_LIMIT.USERS.ONBOARDING.WINDOW_MS,
      maxRequests: RequestConfig.RATE_LIMIT.USERS.ONBOARDING.MAX_REQUESTS,
      errorCode: ErrorCodes.RATE_LIMIT.STRICT,
      message: ErrorMessages.RATE_LIMIT.USER_ONBOARDING,
    }),
  },
  PROPERTIES: {
    SEARCH: rateLimitMiddleware({
      windowMs: RequestConfig.RATE_LIMIT.PROPERTIES.SEARCH.WINDOW_MS,
      maxRequests: RequestConfig.RATE_LIMIT.PROPERTIES.SEARCH.MAX_REQUESTS,
      errorCode: ErrorCodes.RATE_LIMIT.STRICT,
      message: ErrorMessages.RATE_LIMIT.PROPERTY_SEARCH,
    }),
    CREATION: rateLimitMiddleware({
      windowMs: RequestConfig.RATE_LIMIT.PROPERTIES.CREATION.WINDOW_MS,
      maxRequests: RequestConfig.RATE_LIMIT.PROPERTIES.CREATION.MAX_REQUESTS,
      errorCode: ErrorCodes.RATE_LIMIT.STRICT,
      message: ErrorMessages.RATE_LIMIT.PROPERTY_CREATION,
      skipFailedRequests: true,
    }),
    UPDATE: rateLimitMiddleware({
      windowMs: RequestConfig.RATE_LIMIT.PROPERTIES.UPDATE.WINDOW_MS,
      maxRequests: RequestConfig.RATE_LIMIT.PROPERTIES.UPDATE.MAX_REQUESTS,
      errorCode: ErrorCodes.RATE_LIMIT.STRICT,
      message: ErrorMessages.RATE_LIMIT.PROPERTY_UPDATE,
    }),
    PUBLISH: rateLimitMiddleware({
      windowMs: RequestConfig.RATE_LIMIT.PROPERTIES.PUBLISH.WINDOW_MS,
      maxRequests: RequestConfig.RATE_LIMIT.PROPERTIES.PUBLISH.MAX_REQUESTS,
      errorCode: ErrorCodes.RATE_LIMIT.STRICT,
      message: ErrorMessages.RATE_LIMIT.PROPERTY_PUBLISH,
    }),
    STATUS_CHANGE: rateLimitMiddleware({
      windowMs: RequestConfig.RATE_LIMIT.PROPERTIES.STATUS_CHANGE.WINDOW_MS,
      maxRequests: RequestConfig.RATE_LIMIT.PROPERTIES.STATUS_CHANGE.MAX_REQUESTS,
      errorCode: ErrorCodes.RATE_LIMIT.STRICT,
      message: ErrorMessages.RATE_LIMIT.PROPERTY_STATUS_CHANGE,
    }),
    UPLOAD_IMAGES: rateLimitMiddleware({
      windowMs: RequestConfig.RATE_LIMIT.PROPERTIES.UPLOAD_IMAGES.WINDOW_MS,
      maxRequests: RequestConfig.RATE_LIMIT.PROPERTIES.UPLOAD_IMAGES.MAX_REQUESTS,
      errorCode: ErrorCodes.RATE_LIMIT.STRICT,
      message: ErrorMessages.RATE_LIMIT.PROPERTY_IMAGE_UPLOAD,
    }),
    MANAGE_IMAGES: rateLimitMiddleware({
      windowMs: RequestConfig.RATE_LIMIT.PROPERTIES.MANAGE_IMAGES.WINDOW_MS,
      maxRequests: RequestConfig.RATE_LIMIT.PROPERTIES.MANAGE_IMAGES.MAX_REQUESTS,
      errorCode: ErrorCodes.RATE_LIMIT.STRICT,
      message: ErrorMessages.RATE_LIMIT.PROPERTY_IMAGE_MANAGE,
    }),
  },
  AMENITIES: {
    SEARCH: rateLimitMiddleware({
      windowMs: RequestConfig.RATE_LIMIT.AMENITIES.SEARCH.WINDOW_MS,
      maxRequests: RequestConfig.RATE_LIMIT.AMENITIES.SEARCH.MAX_REQUESTS,
      errorCode: ErrorCodes.RATE_LIMIT.STRICT,
      message: ErrorMessages.RATE_LIMIT.AMENITY_SEARCH,
    }),
  },
} as const;
