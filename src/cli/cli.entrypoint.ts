import { Command } from 'commander';
import type { Knex } from 'knex';
import 'reflect-metadata';

import { DI } from '@ioc/constants.js';
import { constructIOC } from '@ioc/container.js';
import { logger } from '@lib/logger.js';
import { getPackageInfo } from '@utils/data.js';

import { createDatabaseCommands } from './commands/db.commands.js';

async function bootstrap() {
  const ioc = constructIOC();

  const packageJson = await getPackageInfo();

  const program = new Command();

  program
    .name('engla-cli')
    .description('CLI Management Tool for EngLa Project')
    .version(packageJson.version);

  createDatabaseCommands(program, ioc);

  program.showHelpAfterError();

  try {
    await program.parseAsync(process.argv);

    if (ioc.isBound(DI.KnexClient)) {
      const knex = ioc.get<Knex>(DI.KnexClient);
      await knex.destroy();
    }

    process.exit(0);
  } catch (error) {
    logger.error('[CLI] Execution failed', { error });
    process.exit(1);
  }
}

// eslint-disable-next-line no-console
bootstrap().catch(console.error);
