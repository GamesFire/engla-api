import type { NextFunction, Request, Response } from 'express';
import { ulid } from 'ulid';

import { LogLevel } from '@lib/constants/app.js';
import { logger } from '@lib/logger.js';
import { HttpContext } from '@utils/http.context.js';

import { HttpHeader } from '../constants/http.js';

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const headerTraceID = req.headers[HttpHeader.X_REQUEST_ID];

  const traceID = (Array.isArray(headerTraceID) ? headerTraceID[0] : headerTraceID) || ulid();

  const meta = {
    traceID,
    url: req.originalUrl || req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get(HttpHeader.USER_AGENT),
  };

  const requestLogger = logger.child(meta);

  req.traceID = traceID;
  req.log = requestLogger;
  req.startTime = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(req.startTime);
    const durationInMs = (diff[0] * 1e9 + diff[1]) / 1e6;

    requestLogger.log(LogLevel.HTTP, `[HTTP] ${req.method} ${req.originalUrl} ${res.statusCode}`, {
      statusCode: res.statusCode,
      duration: `${durationInMs.toFixed(2)}ms`,
    });
  });

  HttpContext.run({ req, res, traceID, logger: requestLogger }, () => {
    next();
  });
};
