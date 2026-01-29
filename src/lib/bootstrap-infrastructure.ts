import { Container } from 'inversify';
import type { Redis } from 'ioredis';
import type { Knex } from 'knex';

import { DI } from '@ioc/constants.js';
import { dbHealthCheck } from '@lib/health/db.health.js';
import { redisHealthCheck } from '@lib/health/redis.health.js';
import { logger } from '@lib/logger.js';
import { GracefulShutdownHandler } from '@utils/graceful-shutdown.js';

/**
 * Initializes and checks all infrastructure connections (DB, Cache, etc.)
 * Registers hooks for proper termination.
 */
export async function bootstrapInfrastructure(ioc: Container): Promise<void> {
  try {
    // --- Redis ---
    const redis = ioc.get<Redis>(DI.RedisClient);
    await redisHealthCheck(redis);
    GracefulShutdownHandler.registerTask(async () => {
      await redis.quit();
      logger.info('[Redis] Connection closed');
    });

    // --- Database (Knex) ---
    const knex = ioc.get<Knex>(DI.KnexClient);
    await dbHealthCheck(knex);
    GracefulShutdownHandler.registerTask(async () => {
      await knex.destroy();
      logger.info('[DB] Connection closed');
    });
  } catch (error) {
    logger.error('[Infrastructure] Initialization failed', { error });
    throw error;
  }
}
