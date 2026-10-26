import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('bookings', (table) => {
    table.comment(
      'Core bookings table storing reservations, financial snapshots, and Stripe metadata',
    );

    table.increments('id').primary();

    // Associate booking with a property
    table
      .integer('property_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('properties')
      .onDelete('RESTRICT'); // Prevent deleting a property that has booking records

    // Associate booking with a user (guest)
    table
      .integer('guest_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT'); // Prevent hard-deleting a guest with booking history

    // Associate booking with a user (host)
    table
      .integer('host_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT') // Prevent hard-deleting a host with booking history
      .comment('Denormalized property owner at booking time');

    // --- Statuses ---
    table
      .enum('status', ['pending', 'confirmed', 'cancelled', 'completed', 'expired'])
      .notNullable()
      .defaultTo('pending');

    table
      .enum('payment_status', ['unpaid', 'paid', 'partially_refunded', 'refunded', 'failed'])
      .notNullable()
      .defaultTo('unpaid');

    // --- Dates & Capacity ---
    table.date('check_in_date').notNullable();
    table.date('check_out_date').notNullable();
    table.integer('nights').unsigned().notNullable();
    table.integer('guests_count').unsigned().notNullable();

    // --- Financial Snapshot (in pence) ---
    table
      .integer('price_per_night')
      .unsigned()
      .notNullable()
      .comment('Snapshot of nightly price in pence at booking time');

    table
      .integer('cleaning_fee')
      .unsigned()
      .notNullable()
      .defaultTo(0)
      .comment('Snapshot of cleaning fee in pence at booking time');

    table
      .integer('nights_subtotal')
      .unsigned()
      .notNullable()
      .comment('price_per_night * nights in pence');

    table
      .integer('total_price')
      .unsigned()
      .notNullable()
      .comment('Total amount charged to guest (nights_subtotal + cleaning_fee) in pence');

    table
      .integer('platform_fee')
      .unsigned()
      .notNullable()
      .comment('Platform commission deducted in pence');

    table
      .integer('host_payout')
      .unsigned()
      .notNullable()
      .comment('Net payout to host (total_price - platform_fee) in pence');

    table.string('currency').notNullable().defaultTo('GBP');

    table
      .enum('cancellation_policy', ['flexible', 'moderate', 'strict'])
      .notNullable()
      .comment('Snapshot of property cancellation policy at booking time');

    table.text('special_requests').nullable();

    // --- Stripe Integration ---
    table.string('stripe_checkout_session_id').nullable().unique();
    table.string('stripe_payment_intent_id').nullable().unique();
    table.string('stripe_refund_id').nullable();

    table
      .integer('refunded_amount')
      .unsigned()
      .notNullable()
      .defaultTo(0)
      .comment('Amount refunded to guest in pence');

    // --- Lifecycle & Audit ---
    table
      .timestamp('expires_at', { useTz: true })
      .nullable()
      .comment('Expiration deadline for unpaid pending bookings');

    table.timestamp('paid_at', { useTz: true }).nullable();
    table.timestamp('cancelled_at', { useTz: true }).nullable();
    table.enum('cancelled_by_role', ['client', 'host', 'admin']).nullable();
    table.text('cancellation_reason').nullable();
    table.timestamp('completed_at', { useTz: true }).nullable();

    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['property_id'], 'idx_bookings_property_id');
    table.index(['guest_id'], 'idx_bookings_guest_id');
    table.index(['host_id'], 'idx_bookings_host_id');
    table.index(['status'], 'idx_bookings_status');
    table.index(
      ['property_id', 'status', 'check_in_date', 'check_out_date'],
      'idx_bookings_availability',
    );
    table.index(['status', 'expires_at'], 'idx_bookings_pending_expiry');
    table.index(['status', 'check_out_date'], 'idx_bookings_completion');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('bookings');
}
