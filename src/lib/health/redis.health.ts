import { Redis } from 'ioredis';

import { logger } from '@lib/logger.js';

/**
 * Checks if Redis connection is alive.
 * Throws an error if PING fails or times out.
 */
export async function redisHealthCheck(redis: Redis): Promise<void> {
  const start = Date.now();
  try {
    const response = await redis.ping();

    if (response !== 'PONG') {
      throw new Error(`Redis responded with ${response} instead of PONG`);
    }

    const duration = Date.now() - start;
    logger.info(`[HealthCheck] Redis is alive (${duration}ms)`);
  } catch (error) {
    logger.error('[HealthCheck] Redis check failed', { error });
    throw error;
  }
}
