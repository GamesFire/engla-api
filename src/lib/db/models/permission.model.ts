import { BaseSystemModel } from './base-system.model.js';

export enum SystemPermission {
  SYSTEM_PERMISSIONS = 'system:permissions',

  USERS_READ = 'users:read',
  USERS_UPDATE = 'users:update',
  USERS_DELETE = 'users:delete',

  PROPERTIES_READ = 'properties:read',
  PROPERTIES_UPDATE = 'properties:update',
  PROPERTIES_DELETE = 'properties:delete',

  BOOKINGS_READ = 'bookings:read',
  BOOKINGS_UPDATE = 'bookings:update',

  DICTIONARIES_MANAGE = 'dictionaries:manage',
}

export interface Permission {
  // --- System & Info ---
  id: number;
  action: SystemPermission;
  description: Nullable<string>;

  // --- Timestamps ---
  createdAt: Date;
  updatedAt: Date;
}

export class PermissionModel extends BaseSystemModel implements Permission {
  static tableName = 'permissions';

  id!: number;
  action!: SystemPermission;
  description!: Nullable<string>;
}
