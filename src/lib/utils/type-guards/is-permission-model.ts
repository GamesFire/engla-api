import type { PermissionModel, SystemPermission } from '@models/permission.model.js';

/**
 * Type Guard to check if an object is an instance of PermissionModel
 * (or at least an object that satisfies the minimum required fields).
 *
 * @param obj - The object to check.
 * @returns True if the object is a PermissionModel (has the 'action' property).
 */
export function isPermissionModel(
  obj: PermissionModel | SystemPermission | unknown,
): obj is PermissionModel {
  return typeof obj === 'object' && obj !== null && 'action' in obj;
}
