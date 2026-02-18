import cors from 'cors';
import express, { type Express, type Request as ExpressRequest } from 'express';
import helmet from 'helmet';
import hpp from 'hpp';

import { appConfig } from '@lib/configs/app.config.js';
import { HttpHeader, HttpMethod } from '@lib/constants/http.js';
import { RequestConfig } from '@lib/constants/limits.js';
import { ApiPrefix, ApiRoutes, SystemRoutes } from '@lib/constants/routes.js';
import { errorMiddleware } from '@lib/middlewares/error.middleware.js';
import { notFoundMiddleware } from '@lib/middlewares/not-found.middleware.js';
import { createRateLimiter } from '@lib/middlewares/rate-limit.middleware.js';
import { requestLoggerMiddleware } from '@lib/middlewares/request-logger.middleware.js';
import { createSystemRouter, createV1Router } from '@routes/index.js';
import { buildApiPath } from '@utils/build-api-path.js';

export async function createServer(): Promise<Express> {
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

  app.use(
    ApiPrefix.API,
    createRateLimiter({
      windowMs: RequestConfig.RATE_LIMIT.GLOBAL.WINDOW_MS,
      max: RequestConfig.RATE_LIMIT.GLOBAL.MAX_REQUESTS,
    }),
  );

  app.use(
    express.json({
      limit: RequestConfig.MAX_BODY_SIZE,
      verify: (req, _res, buf) => {
        const request = req as ExpressRequest;

        if (request.originalUrl && request.originalUrl.includes(ApiRoutes.STRIPE_WEBHOOK)) {
          request.rawBody = buf.toString();
        }
      },
    }),
  );

  app.use(express.urlencoded({ extended: true, limit: RequestConfig.MAX_BODY_SIZE }));
  app.use(hpp());
  app.use(requestLoggerMiddleware);

  app.use(SystemRoutes.ROOT, createSystemRouter());

  const v1Path = buildApiPath(ApiPrefix.V1, ApiRoutes.ROOT);
  app.use(v1Path, createV1Router());

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
