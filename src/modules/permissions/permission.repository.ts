import { provide } from '@ioc/decorators.js';
import { PermissionModel } from '@models/permission.model.js';

import type { GetAllPermissionsParams } from './permission.types.js';

@provide()
export class PermissionRepository {
  public async getAllPermissions(params: GetAllPermissionsParams): Promise<PermissionModel[]> {
    const { orderBy, orderDirection } = params;

    return PermissionModel.query().orderBy(orderBy, orderDirection);
  }
}
