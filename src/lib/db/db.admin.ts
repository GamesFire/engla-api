import pg from 'pg';

import { logger } from '@lib/logger.js';

import { appConfig } from '../configs/app.config.js';

const { Client } = pg;

/**
 * Creates a database if it does not exist.
 * Takes UTF8 encoding into DB.
 */
export async function createDatabase(): Promise<void> {
  const dbName = appConfig.DB_NAME;

  const client = new Client({
    host: appConfig.DB_HOST,
    port: appConfig.DB_PORT,
    user: appConfig.DB_USER,
    password: appConfig.DB_PASS,
    database: appConfig.DB_DEFAULT_NAME,
  });

  try {
    await client.connect();

    const checkRes = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);

    if (checkRes.rowCount === 0) {
      logger.info(`[DB Admin] Database "${dbName}" does not exist. Creating...`);

      await client.query(`CREATE DATABASE "${dbName}" WITH ENCODING 'UTF8'`);
      logger.info(`[DB Admin] Database "${dbName}" created successfully`);
    } else {
      logger.info(`[DB Admin] Database "${dbName}" already exists. Skipping.`);
    }
  } catch (error) {
    logger.error('[DB Admin] Failed to create database', { error });
    throw error;
  } finally {
    await client.end();
  }
}

/**
 * Deletes the database (Only for Dev/Test environments!).
 * Forcibly breaks all active connections before deletion.
 */
export async function dropDatabase(): Promise<void> {
  if (appConfig.isProd) {
    logger.error('[DB Admin] Cannot drop database in PRODUCTION environment!');
    return;
  }

  const dbName = appConfig.DB_NAME;
  const client = new Client({
    host: appConfig.DB_HOST,
    port: appConfig.DB_PORT,
    user: appConfig.DB_USER,
    password: appConfig.DB_PASS,
    database: appConfig.DB_DEFAULT_NAME,
  });

  try {
    await client.connect();

    await client.query(
      `
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
      AND pid <> pg_backend_pid();
    `,
      [dbName],
    );

    await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
    logger.info(`[DB Admin] Database "${dbName}" dropped successfully`);
  } catch (error) {
    logger.error('[DB Admin] Failed to drop database', { error });
    throw error;
  } finally {
    await client.end();
  }
}
