import http from 'http';
import 'reflect-metadata';

import { constructIOC } from '@ioc/container.js';
import { bootstrapInfrastructure } from '@lib/bootstrap-infrastructure.js';
import { appConfig } from '@lib/configs/app.config.js';
import { AppType } from '@lib/constants/app.js';
import { logger } from '@lib/logger.js';
import { GracefulShutdownHandler } from '@utils/graceful-shutdown.js';

import { createServer } from './server.js';

GracefulShutdownHandler.setup();

async function boot() {
  logger.info(`[Boot] Starting EngLa API in ${appConfig.NODE_ENV} mode...`);

  const ioc = (global.ioc = constructIOC());
  logger.info('[Boot] IOC container initialized');

  await bootstrapInfrastructure(ioc);

  switch (appConfig.APP_TYPE) {
    case AppType.WORKER: {
      logger.info('[Worker] Starting worker process...');
      // Implementation pending
      break;
    }

    case AppType.API:
    default: {
      const app = await createServer();
      const server = http.createServer(app);

      server.listen(appConfig.PORT, () => {
        logger.info(`[Server] Running at http://localhost:${appConfig.PORT}`);
      });

      GracefulShutdownHandler.registerTask(async () => {
        return new Promise<void>((resolve) => {
          server.close((err) => {
            if (err) {
              logger.error('[HttpServer] Error while closing', err);
            } else {
              logger.info('[HttpServer] Closed successfully');
            }
            resolve();
          });

          server.closeAllConnections();
        });
      });
      break;
    }
  }
}

boot().catch((err) => {
  logger.error('[FATAL GLOBAL ERROR]', err);
  process.exit(1);
});
