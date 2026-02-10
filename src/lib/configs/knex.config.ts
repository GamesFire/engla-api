import type { Knex } from 'knex';
import { knexSnakeCaseMappers } from 'objection';
import path from 'path';

import { appConfig } from './app.config.js';

const rootDir = process.cwd();

const migrationsDir = path.join(rootDir, 'database', 'migrations');
const seedsDir = path.join(rootDir, 'database', 'seeds');

export const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: appConfig.DB_HOST,
    port: appConfig.DB_PORT,
    user: appConfig.DB_USER,
    password: appConfig.DB_PASS,
    database: appConfig.DB_NAME,
  },
  pool: {
    min: 2,
    max: 10,
  },
  ...knexSnakeCaseMappers(),
  migrations: {
    directory: migrationsDir,
    extension: 'ts',
    loadExtensions: ['.ts', '.js'],
  },
  seeds: {
    directory: seedsDir,
    extension: 'ts',
    loadExtensions: ['.ts', '.js'],
  },
  debug: appConfig.isDev && process.env.DB_DEBUG === 'true',
};
