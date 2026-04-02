import type { Request, Response } from 'express';
import { inject } from 'inversify';

import { provide } from '@ioc/decorators.js';
import { UserService } from '@modules/users/user.service.js';

import {
  adminGetAllUsersQuerySchema,
  adminUpdateUserBodySchema,
  updateUserBodySchema,
  userIdParamSchema,
} from './user.validation.js';

@provide()
export class UserController {
  constructor(@inject(UserService) private readonly _userService: UserService) {
    this.getMe = this.getMe.bind(this);
    this.updateMe = this.updateMe.bind(this);
    this.deleteMe = this.deleteMe.bind(this);

    this.adminGetUserById = this.adminGetUserById.bind(this);
    this.adminGetAllUsers = this.adminGetAllUsers.bind(this);
    this.adminUpdateUser = this.adminUpdateUser.bind(this);
    this.adminDeleteUser = this.adminDeleteUser.bind(this);
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

  public async deleteMe(req: Request, res: Response) {
    const user = req.currentUser!;
    await this._userService.deleteUserAccount(user.id);

    res.status(204).send();
  }

  // --- ADMIN ENDPOINTS ---

  public async adminGetUserById(req: Request, res: Response) {
    const { id: userId } = userIdParamSchema.parse(req.params);
    const user = await this._userService.getUserById(userId);

    res.status(200).json(user);
  }

  public async adminGetAllUsers(req: Request, res: Response) {
    const adminGetAllUsersQueryDto = adminGetAllUsersQuerySchema.parse(req.query);
    const users = await this._userService.getUsers(adminGetAllUsersQueryDto);

    res.status(200).json(users);
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
}
