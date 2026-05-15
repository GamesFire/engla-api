import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('amenities', (table) => {
    table.comment('Global dictionary of available property amenities');

    table.increments('id').primary();

    table
      .enum('scope', ['property', 'experience', 'vehicle'])
      .notNullable()
      .defaultTo('property')
      .comment('Target entity type');

    // Associate amenity with a category
    table
      .integer('category_id')
      .unsigned()
      .nullable()
      .references('id')
      .inTable('amenity_categories')
      .onDelete('RESTRICT') // If it has associated amenities, do not delete the category
      .comment('Grouping category for the UI');

    table.string('name').notNullable().unique();
    table.string('icon_key').nullable().comment('Frontend icon identifier');

    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());

    table.index(['scope'], 'idx_amenities_scope');
    table.index(['category_id'], 'idx_amenities_category_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('amenities');
}
