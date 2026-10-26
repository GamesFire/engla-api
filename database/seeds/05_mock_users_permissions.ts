import type { Knex } from 'knex';

import { appConfig } from '@lib/configs/app.config.js';
import { logger } from '@lib/logger.js';

export async function seed(knex: Knex): Promise<void> {
  if (appConfig.isProd) {
    logger.info('[Seed] Skipping mock user permissions in production environment');
    return;
  }

  await knex.raw('TRUNCATE TABLE users_permissions RESTART IDENTITY CASCADE');

  // Fetch all available permissions to map them dynamically
  const permissions = await knex('permissions').select('id', 'action');

  const getPermId = (actionName: string): number => {
    const perm = permissions.find((p) => p.action === actionName);

    if (!perm) throw new Error(`Permission ${actionName} not found in DB`);

    return perm.id;
  };

  // !Note: We DO NOT assign permissions to ID: 1 (Main Admin) here.
  // The Main Admin uses the ROOT_ADMIN_AUTH0_ID bypass in the permission.middleware.ts
  // which grants them implicit 'God Mode' access to all routes without DB lookups.

  const staffPermissions = [
    // --- Staff 1 (ID: 3 - Sarah Connor, Support Manager) ---
    { user_id: 3, permission_id: getPermId('users:read') },
    { user_id: 3, permission_id: getPermId('users:update') },
    { user_id: 3, permission_id: getPermId('properties:read') },
    { user_id: 3, permission_id: getPermId('properties:update') },
    { user_id: 3, permission_id: getPermId('bookings:read') },
    { user_id: 3, permission_id: getPermId('bookings:update') },

    // --- Staff 2 (ID: 4 - Jack Ward, Content Moderator) ---
    { user_id: 4, permission_id: getPermId('properties:read') },
    { user_id: 4, permission_id: getPermId('properties:update') },
    { user_id: 4, permission_id: getPermId('properties:delete') },
    { user_id: 4, permission_id: getPermId('dictionaries:manage') },
  ];

  await knex('users_permissions').insert(staffPermissions);

  logger.info('[Seed] Mock user permissions created for staff accounts');
}
