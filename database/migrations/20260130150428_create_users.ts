import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.comment('Stores all user accounts including clients, hosts, and admins');

    table.increments('id').primary();

    table.string('auth0_id').unique().notNullable().index().comment('Unique identifier from Auth0');
    table.string('email').notNullable().unique().comment('User email, used as primary contact');

    table.string('first_name').nullable();
    table.string('last_name').nullable();
    table.string('avatar_url').nullable();
    table.string('phone').nullable();

    table.enum('role', ['client', 'host', 'admin']).defaultTo('client').notNullable();
    table.boolean('is_verified').defaultTo(false).comment('Whether email/identity is verified');

    table.string('language').defaultTo('en').notNullable();
    table.string('currency').defaultTo('GBP').notNullable();

    table
      .string('stripe_account_id')
      .nullable()
      .unique()
      .comment('Stripe Connect account ID for hosts');

    table
      .boolean('stripe_onboarding_completed')
      .defaultTo(false)
      .comment('Whether host completed Stripe onboarding');

    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();

    table.index(['role'], 'idx_users_role');
    table.index(['deleted_at'], 'idx_users_deleted_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}
