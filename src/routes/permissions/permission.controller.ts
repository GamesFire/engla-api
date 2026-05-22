import type { Request, Response } from 'express';
import { inject } from 'inversify';

import { provide } from '@ioc/decorators.js';
import { PermissionService } from '@modules/permissions/permission.service.js';
import { getPermissionsQuerySchema } from '@routes/permissions/permission.validation.js';

@provide()
export class PermissionController {
  constructor(@inject(PermissionService) private readonly _permissionService: PermissionService) {
    this.adminGetAllPermissions = this.adminGetAllPermissions.bind(this);
  }

  public async adminGetAllPermissions(req: Request, res: Response) {
    const queryDto = getPermissionsQuerySchema.parse(req.query);
    const permissions = await this._permissionService.getAllPermissions(queryDto);

    res.status(200).json(permissions);
  }
}
