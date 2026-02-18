import rateLimit from 'express-rate-limit';

import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  errorCode?: string;
  message?: string;
}

export const createRateLimiter = (options: RateLimitOptions) => {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      code: options.errorCode || ErrorCodes.TOO_MANY_GLOBAL_REQUESTS,
      message: options.message || ErrorMessages.TOO_MANY_GLOBAL_REQUESTS,
    },
  });
};
