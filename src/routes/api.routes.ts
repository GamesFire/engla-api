import { Router } from 'express';
import type { Container } from 'inversify';

import { ApiRoutes } from '@lib/constants/routes.js';

export function createV1Router(_ioc: Container): Router {
  const router = Router();

  router.get(ApiRoutes.ROOT, (_req, res) => {
    res.json({
      message: 'EngLa API v1 is running',
    });
  });

  return router;
}
