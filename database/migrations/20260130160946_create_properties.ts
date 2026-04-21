import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('properties', (table) => {
    table.comment('Core listings table containing property details and pricing');

    table.increments('id').primary();

    // Associate property with user (host)
    table
      .integer('host_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE') // If user is deleted, delete their properties too
      .comment('Owner of the property');

    table
      .enum('status', ['draft', 'pending', 'active', 'inactive', 'rejected', 'archived'])
      .defaultTo('draft')
      .notNullable()
      .comment('Lifecycle state of the listing');

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

    table.integer('max_guests').unsigned().nullable();
    table.integer('bedrooms').unsigned().nullable();
    table.integer('beds').unsigned().nullable();
    table.integer('bathrooms').unsigned().nullable();
    table.integer('area_sq_m').unsigned().nullable();

    table.string('check_in_time').nullable(); // In 24-hour time format (HH:MM)
    table.string('check_out_time').nullable(); // In 24-hour time format (HH:MM)
    table.boolean('is_pets_allowed').nullable().defaultTo(false);
    table.text('house_rules').nullable();
    table.enum('cancellation_policy', ['flexible', 'moderate', 'strict']).nullable();

    table
      .integer('price_per_night')
      .unsigned()
      .nullable()
      .comment('Base price stored in lowest denomination (pence)');

    table
      .integer('cleaning_fee')
      .unsigned()
      .nullable()
      .defaultTo(0)
      .comment('Cleaning fee in pence');

    table
      .string('license_number', 100)
      .nullable()
      .comment('Legal registration number for short-term lets');

    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();

    table.index(['host_id'], 'idx_properties_host_id');
    table.index(['status'], 'idx_properties_status');
    table.index(['city', 'status'], 'idx_properties_city_status');
    table.index(['price_per_night'], 'idx_properties_price');
    table.index(['deleted_at'], 'idx_properties_deleted_at');
    table.index(['latitude', 'longitude'], 'idx_properties_location');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('properties');
}
