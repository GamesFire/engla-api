import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('permissions', (table) => {
    table.comment('Dictionary of all available granular permissions in the system');

    table.increments('id').primary();

    table
      .string('action')
      .notNullable()
      .unique()
      .comment('Format: "resource:action" (e.g., "users:delete", "properties:update")');

    table.string('description').nullable();

    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('permissions');
}
