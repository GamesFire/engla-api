import http from 'http';
import 'reflect-metadata';

import { appConfig } from '@app/lib/configs/app.config.js';
import { constructIOC } from '@ioc/container.js';
import { AppType } from '@lib/constants/app.js';
import { logger } from '@lib/logger.js';
import { GracefulShutdownHandler } from '@utils/graceful-shutdown.js';

import { bootstrapInfrastructure } from './lib/bootstrapInfrastructure.js';
import { createServer } from './server.js';

GracefulShutdownHandler.setup();

async function boot() {
  logger.info(`[Boot] Starting EngLa API in ${appConfig.NODE_ENV} mode...`);

  const ioc = constructIOC();
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
      const app = await createServer(ioc);
      const server = http.createServer(app);

      server.listen(appConfig.PORT, () => {
        logger.info(`[Server] Running at http://localhost:${appConfig.PORT}`);
      });

      GracefulShutdownHandler.registerTask(async () => {
        return new Promise<void>((resolve) => {
          server.close(() => {
            logger.info('[HttpServer] Closed');
            resolve();
          });
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
