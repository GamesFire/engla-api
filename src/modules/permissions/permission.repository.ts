import { provide } from '@ioc/decorators.js';
import { PermissionModel } from '@models/permission.model.js';

import type { GetPermissionsParams } from './permission.types.js';

@provide()
export class PermissionRepository {
  public async getAllPermissions(params: GetPermissionsParams): Promise<PermissionModel[]> {
    const { orderBy, orderDirection } = params;

    return PermissionModel.query().orderBy(orderBy, orderDirection);
  }
}
