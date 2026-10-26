import type { Knex } from 'knex';

import { logger } from '@lib/logger.js';

export async function seed(knex: Knex): Promise<void> {
  await knex('table_name').del();

  await knex('table_name').insert([
    { id: 1, col_name: 'value_1' },
    { id: 2, col_name: 'value_2' },
  ]);

  logger.info('[Seed] table_name seeded successfully');
}
