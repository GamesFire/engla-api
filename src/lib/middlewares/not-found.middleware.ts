import type { RequestHandler } from 'express';

import { ErrorMessage } from '@lib/constants/error-codes.js';
import { HttpHeader } from '@lib/constants/http.js';
import { HttpError } from '@lib/errors/http.error.js';

export const notFoundMiddleware: RequestHandler = (req, _res, next) => {
  const error = new HttpError({
    statusCode: 404,
    message: ErrorMessage.ROUTE_NOT_FOUND,
    internalPayload: {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get(HttpHeader.USER_AGENT),
    },
  });

  next(error);
};
