import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();

    table.string('auth0_id').unique().notNullable().index();
    table.string('email').notNullable().unique();

    table.string('first_name').nullable();
    table.string('last_name').nullable();
    table.string('avatar_url').nullable();
    table.string('phone').nullable();

    table.enum('role', ['client', 'host', 'admin']).defaultTo('client').notNullable();
    table.boolean('is_verified').defaultTo(false);

    table.string('language').defaultTo('en').notNullable();
    table.string('currency').defaultTo('GBP').notNullable();

    table.string('stripe_account_id').nullable().unique(); // Host account ID in Stripe for payments
    table.boolean('stripe_onboarding_completed').defaultTo(false); // Whether host completed Stripe onboarding

    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true }).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}
