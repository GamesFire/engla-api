import { inject } from 'inversify';

import { provide } from '@ioc/decorators.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';
import { type User } from '@models/users/user.model.js';
import { UserRepository } from '@modules/users/user.repository.js';

import type { SyncUserParams } from './auth.types.js';

@provide()
export class AuthService {
  constructor(@inject(UserRepository) private readonly _userRepository: UserRepository) {}

  public async syncUser(params: SyncUserParams): Promise<User> {
    const { auth0Id, syncUserDto, isEmailVerified } = params;

    const existingUser = await this._userRepository.findByAuth0Id(auth0Id);

    if (existingUser) {
      if (existingUser.isVerified !== isEmailVerified) {
        await this._userRepository.updateSystemDataAndFetchById({
          userId: existingUser.id,
          data: { isVerified: isEmailVerified },
        });
      }

      const hasChanges =
        (syncUserDto.firstName && existingUser.firstName !== syncUserDto.firstName) ||
        (syncUserDto.lastName && existingUser.lastName !== syncUserDto.lastName) ||
        (syncUserDto.avatarUrl && existingUser.avatarUrl !== syncUserDto.avatarUrl);

      if (hasChanges) {
        return this._userRepository.updateProfileAndFetchById({
          userId: existingUser.id,
          data: {
            firstName: syncUserDto.firstName,
            lastName: syncUserDto.lastName,
            avatarUrl: syncUserDto.avatarUrl,
          },
        });
      }

      return existingUser;
    }

    const userByEmail = await this._userRepository.findByEmail(syncUserDto.email);

    if (userByEmail) {
      if (!isEmailVerified) {
        throw new HttpError({
          statusCode: 403,
          message: ErrorMessages.ACCOUNT_LINKING_REQUIRES_VERIFIED_EMAIL,
          internalPayload: {
            code: ErrorCodes.HTTP_FORBIDDEN,
            reason: 'Account linking requires verified email',
          },
        });
      }

      await this._userRepository.updateSystemDataAndFetchById({
        userId: userByEmail.id,
        data: {
          auth0Id: auth0Id,
          isVerified: true,
        },
      });

      return this._userRepository.updateProfileAndFetchById({
        userId: userByEmail.id,
        data: {
          firstName: syncUserDto.firstName,
          lastName: syncUserDto.lastName,
          avatarUrl: syncUserDto.avatarUrl,
        },
      });
    }

    return this._userRepository.createUserAndFetch({
      auth0Id,
      email: syncUserDto.email,
      firstName: syncUserDto.firstName,
      lastName: syncUserDto.lastName,
      avatarUrl: syncUserDto.avatarUrl,
      isVerified: isEmailVerified,
    });
  }
}
