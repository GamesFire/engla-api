import type { Request, Response } from 'express';
import { inject } from 'inversify';

import { provide } from '@ioc/decorators.js';
import { PermissionService } from '@modules/permissions/permission.service.js';
import { getAllPermissionsQuerySchema } from '@routes/permissions/permission.validation.js';

@provide()
export class PermissionController {
  constructor(@inject(PermissionService) private readonly _permissionService: PermissionService) {
    this.adminGetAllPermissions = this.adminGetAllPermissions.bind(this);
  }

  public async adminGetAllPermissions(req: Request, res: Response) {
    const getAllPermissionsQueryDto = getAllPermissionsQuerySchema.parse(req.query);
    const permissions = await this._permissionService.getAllPermissions(getAllPermissionsQueryDto);

    res.status(200).json(permissions);
  }
}
