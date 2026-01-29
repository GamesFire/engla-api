import cors from 'cors';
import express, { type Express, type Request as ExpressRequest } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import type { Container } from 'inversify';

import { appConfig } from '@lib/configs/app.config.js';
import { ErrorCode, ErrorMessage } from '@lib/constants/error-codes.js';
import { HttpHeader, HttpMethod } from '@lib/constants/http.js';
import { RequestLimit } from '@lib/constants/limits.js';
import { ApiPrefix, ApiRoutes, SystemRoutes } from '@lib/constants/routes.js';
import { errorMiddleware } from '@lib/middlewares/error.middleware.js';
import { notFoundMiddleware } from '@lib/middlewares/not-found.middleware.js';
import { requestLoggerMiddleware } from '@lib/middlewares/request-logger.middleware.js';
import { createSystemRouter, createV1Router } from '@routes/index.js';
import { buildApiPath } from '@utils/build-api-path.js';

export async function createServer(ioc: Container): Promise<Express> {
  const app = express();

  if (appConfig.isProd) {
    app.set('trust proxy', 1);
  }

  app.use(helmet());

  app.use(
    cors({
      origin: appConfig.CORS_ORIGIN,
      credentials: true,
      methods: [
        HttpMethod.GET,
        HttpMethod.POST,
        HttpMethod.PUT,
        HttpMethod.PATCH,
        HttpMethod.DELETE,
        HttpMethod.OPTIONS,
      ],
      allowedHeaders: [HttpHeader.CONTENT_TYPE, HttpHeader.AUTHORIZATION, HttpHeader.X_REQUEST_ID],
    }),
  );

  const limiter = rateLimit({
    windowMs: RequestLimit.WINDOW_MS,
    limit: RequestLimit.MAX_REQUESTS_PER_WINDOW,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      code: ErrorCode.TOO_MANY_REQUESTS,
      message: ErrorMessage.TOO_MANY_REQUESTS,
    },
  });

  app.use(ApiPrefix.API, limiter);

  app.use(
    express.json({
      limit: RequestLimit.BODY_SIZE,
      verify: (req, _res, buf) => {
        const request = req as ExpressRequest;

        if (request.originalUrl && request.originalUrl.includes(ApiRoutes.STRIPE_WEBHOOK)) {
          request.rawBody = buf.toString();
        }
      },
    }),
  );

  app.use(express.urlencoded({ extended: true, limit: RequestLimit.BODY_SIZE }));
  app.use(hpp());
  app.use(requestLoggerMiddleware);

  app.use(SystemRoutes.ROOT, createSystemRouter());

  const v1Path = buildApiPath(ApiPrefix.V1, ApiRoutes.ROOT);
  app.use(v1Path, createV1Router(ioc));

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
