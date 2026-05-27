import { Container } from 'inversify';
import { Redis } from 'ioredis';
import type { Knex } from 'knex';

import { getKnexClient } from '@lib/db/knex.client.js';
import { getRedisClient } from '@lib/db/redis.client.js';

import { InjectionToken } from './constants.js';
import { buildProviderModule } from './loader.js';

export function constructIOC(): Container {
  const ioc = new Container();

  ioc
    .bind<Redis>(InjectionToken.RedisClient)
    .toDynamicValue(() => getRedisClient())
    .inSingletonScope();

  ioc
    .bind(Redis)
    .toDynamicValue(() => getRedisClient())
    .inSingletonScope();

  ioc
    .bind<Knex>(InjectionToken.KnexClient)
    .toDynamicValue(() => getKnexClient())
    .inSingletonScope();

  ioc.load(buildProviderModule());

  return ioc;
}
