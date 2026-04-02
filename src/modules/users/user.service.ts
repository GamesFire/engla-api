import { inject } from 'inversify';

import type { PaginatedResponse } from '@app/interfaces/pagination.interface.js';
import { provide } from '@ioc/decorators.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';
import { Auth0Service } from '@lib/integrations/auth0/auth0.service.js';
import { type User } from '@models/users/user.model.js';
import { UserRepository } from '@modules/users/user.repository.js';
import type { AdminUpdateUserBodyDto, UpdateUserBodyDto } from '@routes/users/user.validation.js';

import type { FindUserOptions, GetUsersParams } from './user.types.js';

@provide()
export class UserService {
  constructor(
    @inject(UserRepository) private readonly _userRepository: UserRepository,
    @inject(Auth0Service) private readonly _auth0Service: Auth0Service,
  ) {}

  private async _getExistingUser(userId: number, options?: FindUserOptions): Promise<User> {
    const user = await this._userRepository.findById(userId, options);

    if (!user) {
      throw new HttpError({
        statusCode: 404,
        message: ErrorMessages.USERS.NOT_FOUND,
        internalPayload: { code: ErrorCodes.USERS.NOT_FOUND },
      });
    }

    return user;
  }

  public async getUserById(userId: number): Promise<User> {
    return this._getExistingUser(userId);
  }

  public async getUsers(params: GetUsersParams): Promise<PaginatedResponse<User>> {
    return this._userRepository.getUsers(params);
  }

  public async updateUserProfile(userId: number, dto: UpdateUserBodyDto): Promise<User> {
    return this._userRepository.updateProfileAndFetchById({ userId, data: dto });
  }

  public async updateUserByAdmin(userId: number, dto: AdminUpdateUserBodyDto): Promise<User> {
    const user = await this._getExistingUser(userId, { includeDeleted: true });

    if (Object.keys(dto).length === 0) {
      return user;
    }

    return this._userRepository.updateAndFetchById({
      userId,
      data: dto,
      options: {
        includeDeleted: true,
      },
    });
  }

  public async deleteUserAccount(userId: number): Promise<void> {
    const user = await this._getExistingUser(userId, { modifiers: null });

    // TODO: Before deleting the account, verify that the user has no active bookings.

    await this._auth0Service.deleteUser(user.auth0Id);
    await this._userRepository.softDeleteAndFetchById(userId);
  }

  public async deleteUserByAdmin(userId: number): Promise<void> {
    const user = await this._getExistingUser(userId, { modifiers: null });

    await this._auth0Service.deleteUser(user.auth0Id);
    await this._userRepository.softDeleteAndFetchById(userId);
  }
}
