import rateLimit from 'express-rate-limit';

import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  errorCode?: string;
  message?: string;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
}

export const rateLimitMiddleware = (options: RateLimitOptions) => {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: options.skipFailedRequests || false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    message: {
      status: 'error',
      code: options.errorCode || ErrorCodes.RATE_LIMIT.GLOBAL,
      message: options.message || ErrorMessages.RATE_LIMIT.GLOBAL,
    },
  });
};
