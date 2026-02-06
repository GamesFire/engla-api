import { Container } from 'inversify';
import { Redis } from 'ioredis';
import type { Knex } from 'knex';

import { getKnexClient } from '@lib/db/knex.client.js';
import { getRedisClient } from '@lib/db/redis.client.js';

import { DI } from './constants.js';
import { buildProviderModule } from './loader.js';

export function constructIOC(): Container {
  const ioc = new Container();

  ioc
    .bind<Redis>(DI.RedisClient)
    .toDynamicValue(() => getRedisClient())
    .inSingletonScope();

  ioc
    .bind(Redis)
    .toDynamicValue(() => getRedisClient())
    .inSingletonScope();

  ioc
    .bind<Knex>(DI.KnexClient)
    .toDynamicValue(() => getKnexClient())
    .inSingletonScope();

  ioc.load(buildProviderModule());

  return ioc;
}
