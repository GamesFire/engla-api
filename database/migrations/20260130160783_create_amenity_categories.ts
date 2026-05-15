import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('amenity_categories', (table) => {
    table.comment('Categories for grouping amenities in the UI (e.g., Kitchen, Safety)');

    table.increments('id').primary();
    table.string('name').notNullable().unique();
    table.string('description').nullable();
    table.integer('order').unsigned().defaultTo(0).comment('UI sorting order');

    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('amenity_categories');
}
