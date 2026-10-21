import cron from 'node-cron';

import { constructIOC } from '@ioc/container.js';
import { appConfig } from '@lib/configs/app.config.js';
import { logger } from '@lib/logger.js';
import { PropertyService } from '@modules/properties/property.service.js';

export class PropertyCleanupJob {
  public static schedule(): void {
    const ioc = global.ioc || constructIOC();
    const propertyService = ioc.get(PropertyService);

    const {
      CRON_CLEANUP_SCHEDULE,
      CRON_CLEANUP_DRAFTS_DAYS,
      CRON_CLEANUP_SOFT_DAYS,
      CRON_CLEANUP_HARD_DAYS,
    } = appConfig;

    cron.schedule(CRON_CLEANUP_SCHEDULE, async () => {
      logger.info('[PropertyCleanupJob] Starting scheduled property cleanup...');

      try {
        await propertyService.cleanupStaleDrafts(CRON_CLEANUP_DRAFTS_DAYS);
        await propertyService.performSoftCleanup(CRON_CLEANUP_SOFT_DAYS);
        await propertyService.performHardCleanup(CRON_CLEANUP_HARD_DAYS);

        logger.info('[PropertyCleanupJob] Scheduled property cleanup finished successfully.');
      } catch (error) {
        logger.error('[PropertyCleanupJob] Error during scheduled property cleanup:', error);
      }
    });

    logger.info(`[PropertyCleanupJob] Scheduled to run with pattern: ${CRON_CLEANUP_SCHEDULE}`);
  }
}
