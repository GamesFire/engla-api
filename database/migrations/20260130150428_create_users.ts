import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.comment('Stores all user accounts including clients, hosts, and admins');

    table.increments('id').primary();

    // --- Identity & Profile ---
    table
      .string('auth0_id')
      .notNullable()
      .unique()
      .comment('External identity provider subject ID (Auth0 sub)');

    table.string('email').notNullable().unique();
    table.string('first_name').nullable();
    table.string('last_name').nullable();
    table.string('avatar_url').nullable();
    table.string('phone').nullable();

    // --- Access & Preferences ---
    table.enum('role', ['client', 'host', 'admin']).notNullable().defaultTo('client');
    table.boolean('is_verified').notNullable().defaultTo(false);

    table.string('language').notNullable().defaultTo('en');
    table.string('currency').notNullable().defaultTo('GBP');

    // --- Stripe Connect Integration ---
    table
      .string('stripe_account_id')
      .nullable()
      .unique()
      .comment('Stripe Connect Express account ID for host payouts');

    table.boolean('stripe_onboarding_completed').notNullable().defaultTo(false);

    // --- Lifecycle & Audit ---
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();

    table.index(['role'], 'idx_users_role');
    table.index(['deleted_at'], 'idx_users_deleted_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}
