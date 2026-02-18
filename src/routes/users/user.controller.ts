import type { Request, Response } from 'express';
import { inject } from 'inversify';

import { provide } from '@ioc/decorators.js';
import { UserService } from '@modules/users/user.service.js';

import {
  adminUpdateUserBodySchema,
  getAllUsersQuerySchema,
  updateUserBodySchema,
  userIdParamSchema,
} from './user.validation.js';

@provide()
export class UserController {
  constructor(@inject(UserService) private readonly _userService: UserService) {
    this.getMe = this.getMe.bind(this);
    this.updateMe = this.updateMe.bind(this);
    this.deleteMe = this.deleteMe.bind(this);

    this.getAllUsers = this.getAllUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.deleteUser = this.deleteUser.bind(this);
  }

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

  public async getUserById(req: Request, res: Response) {
    const { id: userId } = userIdParamSchema.parse(req.params);
    const user = await this._userService.getUserById(userId);

    res.status(200).json(user);
  }

  public async getAllUsers(req: Request, res: Response) {
    const getAllUsersQueryDto = getAllUsersQuerySchema.parse(req.query);
    const users = await this._userService.getUsers(getAllUsersQueryDto);

    res.status(200).json(users);
  }

  public async updateUser(req: Request, res: Response) {
    const { id: userId } = userIdParamSchema.parse(req.params);
    const adminUpdateUserBodyDto = adminUpdateUserBodySchema.parse(req.body);

    const updatedUser = await this._userService.updateUserByAdmin(userId, adminUpdateUserBodyDto);

    res.status(200).json(updatedUser);
  }

  public async deleteUser(req: Request, res: Response) {
    const { id: userId } = userIdParamSchema.parse(req.params);
    await this._userService.deleteUserByAdmin(userId);

    res.status(204).send();
  }
}
