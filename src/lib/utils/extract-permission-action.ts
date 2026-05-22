import type { PermissionModel, SystemPermission } from '@models/permission.model.js';

import { isPermissionModel } from './type-guards/is-permission-model.js';

/**
 * Helper to safely extract the action string from either a PermissionModel or a raw string.
 *
 * @param permission - The permission to process.
 * @returns The SystemPermission string.
 */
export function extractPermissionAction(
  permission: PermissionModel | SystemPermission,
): SystemPermission {
  if (isPermissionModel(permission)) {
    return permission.action;
  }

  return permission as SystemPermission;
}
