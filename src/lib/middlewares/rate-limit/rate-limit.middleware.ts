import type { Request } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { RequestConfig } from '@lib/constants/limits.js';
import { formatRateLimitKey } from '@utils/format.js';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  errorCode?: string;
  message?: string;
  skipFailedRequests?: boolean;
  skipSuccessfulRequests?: boolean;
}

const resolveRateLimitKey = (req: Request): string => {
  if (req.currentUser?.id) {
    return formatRateLimitKey(RequestConfig.RATE_LIMIT.KEY_PREFIX.USER, req.currentUser.id);
  }

  if (req.auth?.payload?.sub) {
    return formatRateLimitKey(
      RequestConfig.RATE_LIMIT.KEY_PREFIX.AUTH_SUBJECT,
      req.auth.payload.sub,
    );
  }

  return ipKeyGenerator(req.ip ?? '');
};

export const rateLimitMiddleware = (options: RateLimitOptions) => {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: resolveRateLimitKey,
    skipFailedRequests: options.skipFailedRequests || false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    message: {
      status: 'error',
      code: options.errorCode || ErrorCodes.RATE_LIMIT.GLOBAL,
      message: options.message || ErrorMessages.RATE_LIMIT.GLOBAL,
    },
  });
};
