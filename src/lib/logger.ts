import fs from 'fs';
import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { appConfig } from './configs/app.config.js';
import { getPackageInfo } from './utils/data.js';
import { HttpContext } from './utils/http.context.js';

if (!appConfig.isTest && !fs.existsSync(appConfig.LOG_DIR)) {
  fs.mkdirSync(appConfig.LOG_DIR);
}

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const devFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { timestamp, level, message, stack, service, env, appType, ...meta } = info;

    const logMessage = stack || message;
    const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';

    return `${timestamp} [${level}]: ${logMessage}${metaString}`;
  }),
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: appConfig.isProd ? prodFormat : devFormat,
    handleExceptions: true,
    handleRejections: true,
  }),
];

if (!appConfig.isTest) {
  transports.push(
    new DailyRotateFile({
      filename: path.join(appConfig.LOG_DIR, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: prodFormat,
      level: appConfig.LOG_LEVEL,
    }),
  );

  transports.push(
    new DailyRotateFile({
      filename: path.join(appConfig.LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
      format: prodFormat,
      handleExceptions: true,
      handleRejections: true,
    }),
  );
}

export const logger = winston.createLogger({
  level: appConfig.LOG_LEVEL,
  levels: winston.config.npm.levels,
  defaultMeta: {
    service: (await getPackageInfo()).name,
    env: appConfig.NODE_ENV,
    appType: appConfig.APP_TYPE,
  },
  transports,
  exitOnError: false,
});

/**
 * Smart logger getter.
 * If we are inside an HTTP request -> returns Child Logger with TraceID.
 * If we are at the start of the application or in CRON -> returns Global Logger.
 */
export function getLogger() {
  return HttpContext.getLogger() || logger;
}
