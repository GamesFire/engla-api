import type { Knex } from 'knex';

import { logger } from '@lib/logger.js';

export async function seed(knex: Knex): Promise<void> {
  // !CRITICAL: We DO NOT use TRUNCATE here.
  // Truncating with CASCADE would wipe out all assigned permissions in 'users_permissions'.
  // Instead, we use UPSERT (Insert or Update) to safely apply new permissions or update descriptions
  // without breaking existing relations in production.

  const permissions = [
    // --- SYSTEM ---
    { action: 'system:permissions', description: 'Grant or revoke permissions for other admins' },

    // --- USERS ---
    { action: 'users:read', description: 'View all users and their details' },
    { action: 'users:update', description: 'Modify user profiles, statuses, and roles' },
    { action: 'users:delete', description: 'Perform soft or hard deletion of user accounts' },

    // --- PROPERTIES ---
    { action: 'properties:read', description: 'View all properties, including drafts and pending' },
    { action: 'properties:update', description: 'Modify properties (e.g., approve or reject)' },
    { action: 'properties:delete', description: 'Archive or delete properties' },

    // --- DICTIONARIES ---
    {
      action: 'dictionaries:manage',
      description: 'Create, update, or delete global amenities and amenity categories',
    },
  ];

  await knex('permissions')
    .insert(permissions)
    .onConflict('action') // 'action' must be UNIQUE in the schema
    .merge(); // Updates the description if it has changed in the code

  logger.info(`[Seed] System permissions verified/inserted (${permissions.length} total)`);
}
