import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users_permissions', (table) => {
    table.comment('Many-to-many relationship between users and permissions');

    // Associate permission with a user
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE'); // If user is deleted, delete associated permissions too

    // Associate user with a permission
    table
      .integer('permission_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('permissions')
      .onDelete('CASCADE'); // If permission is deleted, delete associated user links too

    table.primary(['user_id', 'permission_id']); // Composite primary key

    table.index(['permission_id'], 'idx_users_permissions_permission_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users_permissions');
}
