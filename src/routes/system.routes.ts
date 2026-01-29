import { Router } from 'express';

import { appConfig } from '@lib/configs/app.config.js';
import { SystemRoutes } from '@lib/constants/routes.js';

export function createSystemRouter(): Router {
  const router = Router();

  router.get([SystemRoutes.FAVICON, SystemRoutes.ROBOTS, SystemRoutes.WELL_KNOWN], (_req, res) => {
    res.status(204).end();
  });

  router.get(SystemRoutes.HEALTH, (_req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      env: appConfig.NODE_ENV,
    });
  });

  return router;
}
