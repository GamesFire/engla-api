import type { Request, Response } from 'express';
import { inject } from 'inversify';

import { provide } from '@ioc/decorators.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';
import { UserService } from '@modules/users/user.service.js';

import {
  adminGetUsersQuerySchema,
  adminSyncPermissionsBodySchema,
  adminUpdateUserBodySchema,
  updateUserBodySchema,
  userIdParamSchema,
} from './user.validation.js';

@provide()
export class UserController {
  constructor(@inject(UserService) private readonly _userService: UserService) {
    this.getMe = this.getMe.bind(this);
    this.updateMe = this.updateMe.bind(this);
    this.uploadMyAvatar = this.uploadMyAvatar.bind(this);
    this.deleteMe = this.deleteMe.bind(this);

    this.adminGetUserById = this.adminGetUserById.bind(this);
    this.adminGetUsers = this.adminGetUsers.bind(this);
    this.adminGetUserPermissions = this.adminGetUserPermissions.bind(this);
    this.adminUpdateUser = this.adminUpdateUser.bind(this);
    this.adminDeleteUser = this.adminDeleteUser.bind(this);
    this.adminSyncUserPermissions = this.adminSyncUserPermissions.bind(this);
  }

  // --- PROTECTED ENDPOINTS (Users/Hosts) ---

  public getMe(req: Request, res: Response) {
    const user = req.currentUser!;

    res.status(200).json(user);
  }

  public async updateMe(req: Request, res: Response) {
    const user = req.currentUser!;
    const updateUserBodyDto = updateUserBodySchema.parse(req.body);

    const updatedUser = await this._userService.updateUserProfile(user.id, updateUserBodyDto);

    res.status(200).json(updatedUser);
  }

  // ! TODO: E2E Testing Required (Avatar Upload & Auth0 Sync)
  // ! Currently untestable via Auth0 Dashboard "Test" tab because test tokens lack a real user context,
  // ! which means Auth0 Actions (custom_picture injection) are not triggered.
  // ! Verify this once the SPA client flow is ready.
  public async uploadMyAvatar(req: Request, res: Response) {
    const user = req.currentUser!;
    const file = req.file;

    if (!file) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.UPLOAD.NO_FILE_PROVIDED,
        internalPayload: { code: ErrorCodes.UPLOAD.NO_FILE_PROVIDED },
      });
    }

    const updatedUser = await this._userService.uploadAvatar({
      userId: user.id,
      auth0Id: user.auth0Id,
      fileBuffer: file.buffer,
    });

    res.status(200).json(updatedUser);
  }

  public async deleteMe(req: Request, res: Response) {
    const user = req.currentUser!;
    await this._userService.deleteUserAccount(user.id);

    res.status(204).send();
  }

  // --- ADMIN ENDPOINTS ---

  public async adminGetUserById(req: Request, res: Response) {
    const { id: userId } = userIdParamSchema.parse(req.params);
    const user = await this._userService.getUserByIdForAdmin(userId);

    res.status(200).json(user);
  }

  public async adminGetUsers(req: Request, res: Response) {
    const adminGetUsersQueryDto = adminGetUsersQuerySchema.parse(req.query);
    const users = await this._userService.getUsers(adminGetUsersQueryDto);

    res.status(200).json(users);
  }

  public async adminGetUserPermissions(req: Request, res: Response) {
    const { id: userId } = userIdParamSchema.parse(req.params);
    const permissions = await this._userService.getUserPermissions(userId);

    res.status(200).json(permissions);
  }

  public async adminUpdateUser(req: Request, res: Response) {
    const { id: userId } = userIdParamSchema.parse(req.params);
    const adminUpdateUserBodyDto = adminUpdateUserBodySchema.parse(req.body);

    const updatedUser = await this._userService.updateUserByAdmin(userId, adminUpdateUserBodyDto);

    res.status(200).json(updatedUser);
  }

  public async adminDeleteUser(req: Request, res: Response) {
    const { id: userId } = userIdParamSchema.parse(req.params);
    await this._userService.deleteUserByAdmin(userId);

    res.status(204).send();
  }

  public async adminSyncUserPermissions(req: Request, res: Response) {
    const { id: userId } = userIdParamSchema.parse(req.params);
    const adminSyncPermissionsBodyDto = adminSyncPermissionsBodySchema.parse(req.body);

    const permissions = await this._userService.syncUserPermissionsByAdmin(
      userId,
      adminSyncPermissionsBodyDto,
    );

    res.status(200).json(permissions);
  }
}
