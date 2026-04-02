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

    table
      .enum('status', ['draft', 'pending', 'active', 'inactive', 'rejected', 'archived'])
      .defaultTo('draft')
      .notNullable();

    table.enum('property_type', ['apartment', 'house', 'guesthouse', 'hotel']).notNullable();
    table.enum('room_type', ['entire_place', 'private_room', 'shared_room']).nullable();
    table.string('title').nullable();
    table.text('description').nullable();

    // Address (UK Format)
    table.string('address_line1').nullable();
    table.string('address_line2').nullable();
    table.string('city').nullable();
    table.string('county').nullable();
    table.string('postcode').nullable();

    // Coordinates
    table.decimal('latitude', 10, 7).nullable();
    table.decimal('longitude', 10, 7).nullable();

    table.integer('max_guests').nullable();
    table.integer('bedrooms').nullable();
    table.integer('beds').nullable();
    table.integer('bathrooms').nullable();
    table.integer('area_sq_m').nullable();

    table.string('check_in_time').nullable(); // In 24-hour time format (HH:MM)
    table.string('check_out_time').nullable(); // In 24-hour time format (HH:MM)
    table.boolean('is_pets_allowed').nullable().defaultTo(false);
    table.text('house_rules').nullable();
    table.enum('cancellation_policy', ['flexible', 'moderate', 'strict']).nullable();

    table.integer('price_per_night').nullable(); // In pence
    table.integer('cleaning_fee').nullable().defaultTo(0); // In pence

    table.string('license_number', 100).nullable();

    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.timestamp('deleted_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('properties');
}
