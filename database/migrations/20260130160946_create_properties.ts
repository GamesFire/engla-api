import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('properties', (table) => {
    table.comment('Core listings table containing property details and pricing');

    table.increments('id').primary();

    // Associate property with a user (host)
    table
      .integer('host_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE'); // If user is deleted, delete their properties too

    // --- Core Details & Classification ---
    table
      .enum('status', ['draft', 'pending', 'active', 'inactive', 'rejected', 'archived'])
      .notNullable()
      .defaultTo('draft');

    table.enum('property_type', ['apartment', 'house', 'guesthouse', 'hotel']).notNullable();
    table.enum('room_type', ['entire_place', 'private_room', 'shared_room']).nullable();
    table.string('title').nullable();
    table.text('description').nullable();

    // --- Address (UK Format) ---
    table.string('address_line1').nullable();
    table.string('address_line2').nullable();
    table.string('city').nullable();
    table.string('county').nullable();
    table.string('postcode').nullable();

    // --- Coordinates ---
    table.decimal('latitude', 10, 7).nullable();
    table.decimal('longitude', 10, 7).nullable();

    // --- Capacity & Specs ---
    table.integer('max_guests').unsigned().nullable();
    table.integer('bedrooms').unsigned().nullable();
    table.integer('beds').unsigned().nullable();
    table.integer('bathrooms').unsigned().nullable();
    table.integer('area_sq_m').unsigned().nullable();

    // --- Rules & Policies ---
    table.string('check_in_time').nullable().comment('24-hour time format (HH:MM)');
    table.string('check_out_time').nullable().comment('24-hour time format (HH:MM)');
    table.boolean('is_pets_allowed').nullable().defaultTo(false);
    table.text('house_rules').nullable();
    table.enum('cancellation_policy', ['flexible', 'moderate', 'strict']).nullable();

    // --- Pricing & Moderation ---
    table
      .integer('price_per_night')
      .unsigned()
      .nullable()
      .comment('Base nightly price in lowest currency unit (pence)');

    table
      .integer('cleaning_fee')
      .unsigned()
      .nullable()
      .defaultTo(0)
      .comment('One-time cleaning fee in lowest currency unit (pence)');

    table
      .string('license_number')
      .nullable()
      .comment('Legal registration number for short-term lets');

    table
      .boolean('auto_activate_on_approval')
      .notNullable()
      .defaultTo(true)
      .comment('If true, transitions to ACTIVE upon approval; otherwise INACTIVE');

    table.text('rejection_reason').nullable();

    // --- Lifecycle & Audit ---
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
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
