import { Command } from 'commander';
import { Container } from 'inversify';
import type { Knex } from 'knex';

import { createDatabase, dropDatabase } from '@app/lib/db/db.admin.js';
import { DI } from '@ioc/constants.js';
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
    .description('Drop and re-create the database (Fresh start)')
    .action(async () => {
      await dropDatabase();
      await createDatabase();
    });

  // --- Migrations ---

  program
    .command('db:migrate')
    .description('Run pending migrations (up)')
    .action(async () => {
      const knex = ioc.get<Knex>(DI.KnexClient);
      try {
        const [batchNo, log] = await knex.migrate.latest();
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
      const knex = ioc.get<Knex>(DI.KnexClient);
      try {
        const [batchNo, log] = await knex.migrate.rollback();
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
    .description('Create a new migration file')
    .action(async (name) => {
      const knex = ioc.get<Knex>(DI.KnexClient);
      try {
        const res = await knex.migrate.make(name);
        logger.info(`[Migration] Created: ${res}`);
      } catch (error) {
        logger.error('[Migration] Create failed', { error });
        process.exit(1);
      }
    });

  // --- Seeding ---

  program
    .command('db:seed')
    .description('Run database seeds')
    .action(async () => {
      const knex = ioc.get<Knex>(DI.KnexClient);
      try {
        const [log] = await knex.seed.run();
        if (log.length === 0) {
          logger.info('[Seed] No seed files run');
        } else {
          logger.info(`[Seed] Ran ${log.length} seed files`);
          log.forEach((file: string) => logger.info(`  seed: ${file}`));
        }
      } catch (error) {
        logger.error('[Seed] Failed', { error });
        process.exit(1);
      }
    });
}
