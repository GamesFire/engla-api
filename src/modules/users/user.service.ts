import { inject } from 'inversify';

import type { PaginatedResponse } from '@app/interfaces/pagination.interface.js';
import { provide } from '@ioc/decorators.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';
import { type User } from '@models/users/user.model.js';
import { UserRepository } from '@modules/users/user.repository.js';
import type { AdminUpdateUserBodyDto, UpdateUserBodyDto } from '@routes/users/user.validation.js';

import type { GetUsersParams } from './user.types.js';

@provide()
export class UserService {
  constructor(@inject(UserRepository) private readonly _userRepository: UserRepository) {}

  public async getUserById(userId: number): Promise<User> {
    const user = await this._userRepository.findById(userId);

    if (!user) {
      throw new HttpError({
        statusCode: 404,
        message: ErrorMessages.USER_PROFILE_NOT_FOUND,
        internalPayload: { code: ErrorCodes.USER_NOT_FOUND },
      });
    }

    return user;
  }

  public async getUsers(params: GetUsersParams): Promise<PaginatedResponse<User>> {
    return this._userRepository.getUsers(params);
  }

  public async updateUserProfile(userId: number, dto: UpdateUserBodyDto): Promise<User> {
    return this._userRepository.updateProfileAndFetchById({ userId, data: dto });
  }

  public async updateUserByAdmin(userId: number, dto: AdminUpdateUserBodyDto): Promise<User> {
    const user = await this._userRepository.findById(userId, { includeDeleted: true });

    if (!user) {
      throw new HttpError({
        statusCode: 404,
        message: ErrorMessages.USER_PROFILE_NOT_FOUND,
        internalPayload: { code: ErrorCodes.USER_NOT_FOUND },
      });
    }

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
    // TODO: Before deleting the account, verify that the user has no active bookings.
    // If active bookings exist, prevent account deletion and return an appropriate error.
    // Additional cleanup logic (e.g., soft delete, related data handling, audit logging)
    // may also be required here in the future.
    await this._userRepository.removeUserAndFetchById(userId);
  }

  public async deleteUserByAdmin(userId: number): Promise<void> {
    const user = await this._userRepository.findById(userId);

    if (!user) {
      throw new HttpError({
        statusCode: 404,
        message: ErrorMessages.USER_PROFILE_NOT_FOUND,
      });
    }

    await this._userRepository.removeUserAndFetchById(userId);
  }
}
