import { inject } from 'inversify';

import { provide } from '@ioc/decorators.js';
import type { PermissionModel } from '@models/permission.model.js';

import { PermissionRepository } from './permission.repository.js';
import type { GetAllPermissionsParams } from './permission.types.js';

@provide()
export class PermissionService {
  constructor(
    @inject(PermissionRepository) private readonly _permissionRepository: PermissionRepository,
  ) {}

  public async getAllPermissions(params: GetAllPermissionsParams): Promise<PermissionModel[]> {
    return this._permissionRepository.getAllPermissions(params);
  }
}
