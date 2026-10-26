import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('property_images', (table) => {
    table.comment('Stores gallery images associated with properties');

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

    table
      .string('public_id')
      .nullable()
      .comment(
        'Provider-specific external asset identifier (e.g., used for cloud transformations and deletions)',
      );

    table.boolean('is_main').notNullable().defaultTo(false);
    table.integer('order').unsigned().notNullable().defaultTo(0).comment('UI sorting order');

    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['property_id'], 'idx_property_images_property_id');
    table.index(['property_id', 'is_main'], 'idx_property_images_main');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('property_images');
}
