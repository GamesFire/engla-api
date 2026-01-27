import type { Knex } from 'knex';

import { logger } from '@lib/logger.js';

/**
 * Checks if Database connection is alive by running a simple query.
 */
export async function dbHealthCheck(knex: Knex): Promise<void> {
  const start = Date.now();
  try {
    await knex.raw('SELECT 1');

    const duration = Date.now() - start;
    logger.info(`[HealthCheck] Database is alive (${duration}ms)`);
  } catch (error) {
    logger.error('[HealthCheck] Database check failed', { error });
    throw error;
  }
}
