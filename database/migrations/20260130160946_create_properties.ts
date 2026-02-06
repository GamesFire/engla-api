import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('properties', (table) => {
    table.increments('id').primary();

    // Associate property with user (host)
    table
      .integer('host_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE'); // If user is deleted, delete their properties too

    table.string('title').notNullable();
    table.text('description').notNullable();

    // Address (UK Format)
    table.string('address_line_1').notNullable();
    table.string('address_line_2').nullable();
    table.string('city').notNullable();
    table.string('county').nullable();
    table.string('postcode').notNullable();

    // Coordinates
    table.decimal('latitude', 10, 7).nullable();
    table.decimal('longitude', 10, 7).nullable();

    table.integer('price_per_night').notNullable(); // In pence
    table.integer('cleaning_fee').defaultTo(0); // In pence

    table.enum('property_type', ['apartment', 'house', 'guesthouse', 'hotel']).notNullable();
    table.enum('room_type', ['entire_place', 'private_room', 'shared_room']).notNullable();
    table.integer('max_guests').notNullable();
    table.integer('bedrooms').notNullable();
    table.integer('beds').notNullable();
    table.integer('bathrooms').notNullable();
    table.integer('area_sq_m').nullable();
    table.boolean('is_pets_allowed').defaultTo(false);

    table
      .enum('status', ['draft', 'pending', 'active', 'rejected', 'archived'])
      .defaultTo('draft')
      .notNullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('properties');
}
