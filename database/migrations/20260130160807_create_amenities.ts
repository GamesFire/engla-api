import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('amenities', (table) => {
    table.comment('Global dictionary of available property amenities (e.g., Wi-Fi, Pool)');

    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('icon_key').nullable().comment('Frontend icon identifier');
    table.string('category').nullable().comment('Grouping category (e.g., Safety, Comfort)');

    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index(['category'], 'idx_amenities_category');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('amenities');
}
