import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('properties_amenities', (table) => {
    // Associate amenity with a property
    table
      .integer('property_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('properties')
      .onDelete('CASCADE'); // If property is deleted, delete associated amenities too

    // Associate property with an amenity
    table
      .integer('amenity_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('amenities')
      .onDelete('CASCADE'); // If amenity is deleted, delete associated properties too

    table.primary(['property_id', 'amenity_id']); // Composite primary key
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('properties_amenities');
}
