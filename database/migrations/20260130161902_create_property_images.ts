import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('property_images', (table) => {
    table.increments('id').primary();

    // Associate image with a property
    table
      .integer('property_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('properties')
      .onDelete('CASCADE'); // If property is deleted, delete associated images too

    table.string('url').notNullable();
    table.string('public_id').nullable();
    table.boolean('is_main').defaultTo(false);
    table.integer('order').defaultTo(0);

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('property_images');
}
