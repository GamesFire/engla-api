import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('permissions', (table) => {
    table.comment('Dictionary of all available granular permissions in the system');

    table.increments('id').primary();

    table
      .string('action')
      .unique()
      .notNullable()
      .comment('E.g., "users:delete", "properties:manage"');

    table.string('description').nullable().comment('Human-readable explanation of the permission');

    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('permissions');
}
