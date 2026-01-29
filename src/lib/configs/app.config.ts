import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

import { AppType, LogLevel, NodeEnv } from '../constants/app.js';

export type AppConfig = {
  // --- System params ---
  NODE_ENV: NodeEnv;
  PORT: number;
  APP_TYPE: AppType;
  // --- Security params ---
  CORS_ORIGIN: string;
  // --- Logger params ---
  LOG_LEVEL: LogLevel;
  LOG_DIR: string;
  // --- Database params ---
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;
  DB_PASS: string;
  DB_NAME: string;
  DB_DEFAULT_NAME: string;
  // --- Redis params ---
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASS: Undefinable<string>;
  REDIS_DB: number;
  // --- Flags ---
  isDev: boolean;
  isProd: boolean;
  isTest: boolean;
  isStaging: boolean;
};

dotenv.config({
  path:
    process.env.NODE_ENV === NodeEnv.TEST
      ? path.resolve(process.cwd(), '.env.test')
      : path.resolve(process.cwd(), '.env'),
});

const envAppSchema = z.object({
  NODE_ENV: z.enum(NodeEnv).default(NodeEnv.DEVELOPMENT),
  PORT: z.coerce.number().default(4000),
  APP_TYPE: z.enum(AppType).default(AppType.API),
  CORS_ORIGIN: z.string(),
  LOG_LEVEL: z.enum(LogLevel).default(LogLevel.INFO),
  LOG_DIR: z.string().default('logs'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),
  DB_DEFAULT_NAME: z.string(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASS: z.string(),
  REDIS_DB: z.coerce.number().default(0),
});

const _envApp = envAppSchema.safeParse(process.env);

if (!_envApp.success) {
  const formattedErrors = _envApp.error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

  // eslint-disable-next-line no-console
  console.error('Invalid environment variables:', JSON.stringify(formattedErrors, null, 2));
  process.exit(1);
}

export const appConfig: AppConfig = {
  ..._envApp.data,
  isDev: _envApp.data.NODE_ENV === NodeEnv.DEVELOPMENT,
  isProd: _envApp.data.NODE_ENV === NodeEnv.PRODUCTION,
  isTest: _envApp.data.NODE_ENV === NodeEnv.TEST,
  isStaging: _envApp.data.NODE_ENV === NodeEnv.STAGING,
};
