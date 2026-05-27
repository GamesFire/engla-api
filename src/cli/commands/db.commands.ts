import { Command } from 'commander';
import fs from 'fs';
import { Container } from 'inversify';
import type { Knex } from 'knex';
import path from 'path';

import { InjectionToken } from '@ioc/constants.js';
import { knexConfig } from '@lib/configs/knex.config.js';
import { createDatabase, dropDatabase } from '@lib/db/db.admin.js';
import { logger } from '@lib/logger.js';

export function createDatabaseCommands(program: Command, ioc: Container) {
  // --- Setup & Teardown ---

  program
    .command('db:create')
    .description('Create the database if it does not exist')
    .action(async () => {
      await createDatabase();
    });

  program
    .command('db:drop')
    .description('Drop the database (Dev only). Forces disconnection of active users.')
    .action(async () => {
      await dropDatabase();
    });

  program
    .command('db:reset')
    .description(
      'Drop and re-create the database (Fresh start) (Dev only). Forces disconnection of active users.',
    )
    .action(async () => {
      await dropDatabase();
      await createDatabase();
    });

  // --- Migrations ---

  program
    .command('db:migrate')
    .description('Run pending migrations (up)')
    .action(async () => {
      const knex = ioc.get<Knex>(InjectionToken.KnexClient);
      try {
        const [batchNo, log]: [number, string[]] = await knex.migrate.latest();
        if (log.length === 0) {
          logger.info('[Migrate] Already up to date');
        } else {
          logger.info(`[Migrate] Batch ${batchNo} run: ${log.length} migrations`);
          log.forEach((file: string) => logger.info(`  > ${file}`));
        }
      } catch (error) {
        logger.error('[Migrate] Failed', { error });
        process.exit(1);
      }
    });

  program
    .command('db:rollback')
    .description('Rollback the last batch of migrations')
    .action(async () => {
      const knex = ioc.get<Knex>(InjectionToken.KnexClient);
      try {
        const [batchNo, log]: [number, string[]] = await knex.migrate.rollback();
        if (log.length === 0) {
          logger.info('[Rollback] Already at the base');
        } else {
          logger.info(`[Rollback] Reverted Batch ${batchNo}`);
          log.forEach((file: string) => logger.info(`  < ${file}`));
        }
      } catch (error) {
        logger.error('[Rollback] Failed', { error });
        process.exit(1);
      }
    });

  program
    .command('db:make:migration <name>')
    .description('Create a new migration file (e.g., create_users)')
    .action(async (name) => {
      const knex = ioc.get<Knex>(InjectionToken.KnexClient);
      try {
        const res = await knex.migrate.make(name);
        logger.info(`[Migration] Created: ${res}`);
      } catch (error) {
        logger.error('[Migration] Create failed', { error });
        process.exit(1);
      }
    });

  program
    .command('db:delete:migration <name>')
    .description(
      'Physically delete a migration file from the disk (e.g., 20260130150428_create_users.ts)',
    )
    .action(async (name) => {
      try {
        const rawMigrationDir = knexConfig.migrations?.directory;

        if (!rawMigrationDir) {
          throw new Error('Migrations directory is not defined in knexConfig');
        }

        const migrationDir =
          typeof rawMigrationDir === 'string' ? rawMigrationDir : rawMigrationDir[0];

        if (!migrationDir) {
          throw new Error('Resolved migrations directory is invalid or empty in knexConfig');
        }

        const filePath = path.join(migrationDir, name);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info(`[Delete] Successfully deleted migration file: ${name}`);
        } else {
          logger.warn(`[Delete] File not found at path: ${filePath}`);
        }
      } catch (error) {
        logger.error(`[Delete] Failed to delete migration ${name}`, { error });
        process.exit(1);
      }
    });

  program
    .command('db:run:migration <name>')
    .description(
      'Run a specific pending migration file (up) (e.g., 20260130150428_create_users.ts)',
    )
    .action(async (name) => {
      const knex = ioc.get<Knex>(InjectionToken.KnexClient);
      try {
        await knex.migrate.up({ name });
        logger.info(`[Migrate] Successfully ran specific migration: ${name}`);
      } catch (error) {
        logger.error(`[Migrate] Failed to run migration ${name}`, { error });
        process.exit(1);
      }
    });

  program
    .command('db:rollback:migration <name>')
    .description('Rollback a specific migration file (e.g., 20260130150428_create_users.ts)')
    .action(async (name) => {
      const knex = ioc.get<Knex>(InjectionToken.KnexClient);
      try {
        await knex.migrate.down({ name });
        logger.info(`[Rollback] Successfully reverted specific migration: ${name}`);
      } catch (error) {
        logger.error(`[Rollback] Failed to revert migration ${name}`, { error });
        process.exit(1);
      }
    });

  // --- Seeding ---

  program
    .command('db:seed')
    .description('Run all database seeds')
    .action(async () => {
      const knex = ioc.get<Knex>(InjectionToken.KnexClient);
      try {
        const [log] = await knex.seed.run();
        if (log.length === 0) {
          logger.info('[Seed] No seed files run');
        } else {
          logger.info(`[Seed] Ran ${log.length} seed files`);
          log.forEach((file: string) => logger.info(`  > ${file}`));
        }
      } catch (error) {
        logger.error('[Seed] Failed', { error });
        process.exit(1);
      }
    });

  program
    .command('db:make:seed <name>')
    .description('Create a new seed file (e.g., 01_system_amenity_categories)')
    .action(async (name) => {
      const knex = ioc.get<Knex>(InjectionToken.KnexClient);
      try {
        const res = await knex.seed.make(name);
        logger.info(`[Seed] Created: ${res}`);
      } catch (error) {
        logger.error('[Seed] Create failed', { error });
        process.exit(1);
      }
    });

  program
    .command('db:delete:seed <name>')
    .description(
      'Physically delete a seed file from the disk (e.g., 01_system_amenity_categories.ts)',
    )
    .action(async (name) => {
      try {
        const rawSeedDir = knexConfig.seeds?.directory;

        if (!rawSeedDir || typeof rawSeedDir !== 'string') {
          throw new Error('Seeds directory is invalid or not defined in knexConfig');
        }

        const filePath = path.join(rawSeedDir, name);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info(`[Delete] Successfully deleted seed file: ${name}`);
        } else {
          logger.warn(`[Delete] File not found at path: ${filePath}`);
        }
      } catch (error) {
        logger.error(`[Delete] Failed to delete seed ${name}`, { error });
        process.exit(1);
      }
    });

  program
    .command('db:run:seed <name>')
    .description('Run a specific seed file (e.g., 01_system_amenity_categories.ts)')
    .action(async (name) => {
      const knex = ioc.get<Knex>(InjectionToken.KnexClient);
      try {
        await knex.seed.run({ specific: name });
        logger.info(`[Seed] Successfully ran specific seed: ${name}`);
      } catch (error) {
        logger.error(`[Seed] Failed to run seed ${name}`, { error });
        process.exit(1);
      }
    });
}
