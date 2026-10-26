import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('property_blocked_dates', (table) => {
    table.comment('Manual calendar blocks set by hosts to prevent bookings on specific dates');

    table.increments('id').primary();

    // Associate blocked date range with a property
    table
      .integer('property_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('properties')
      .onDelete('CASCADE'); // If property is deleted, delete its blocked dates too

    table
      .date('start_date')
      .notNullable()
      .comment('Inclusive start date of the blocked period (YYYY-MM-DD)');

    table
      .date('end_date')
      .notNullable()
      .comment('Exclusive end date of the blocked period (YYYY-MM-DD)');

    table.string('reason').nullable();

    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['property_id', 'start_date', 'end_date'], 'idx_property_blocked_dates_range');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('property_blocked_dates');
}
