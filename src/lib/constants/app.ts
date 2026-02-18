export const AppType = {
  API: 'api',
  WORKER: 'worker',
} as const;
export type AppType = (typeof AppType)[keyof typeof AppType];

export const NodeEnv = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
  STAGING: 'staging',
} as const;
export type NodeEnv = (typeof NodeEnv)[keyof typeof NodeEnv];

export const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  DEBUG: 'debug',
} as const;
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];
