import { Redis, type RedisOptions } from 'ioredis';

import { appConfig } from '../configs/app.config.js';

export function getRedisConnectionOptions(): RedisOptions {
  return {
    host: appConfig.REDIS_HOST,
    port: appConfig.REDIS_PORT,
    password: appConfig.REDIS_PASS,
    db: appConfig.REDIS_DB,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  };
}

let __client: Nullable<Redis> = null;

export function getRedisClient(): Redis {
  if (!__client) {
    __client = new Redis(getRedisConnectionOptions());

    __client.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[Redis] Connection Error', err.message);
    });
  }
  return __client;
}
