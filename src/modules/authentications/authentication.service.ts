import { inject } from 'inversify';

import { provide } from '@ioc/decorators.js';
import { ErrorCode, ErrorMessage } from '@lib/constants/errors.js';
import { UserModel } from '@lib/db/models/users/user.model.js';
import { HttpError } from '@lib/errors/http.error.js';
import { UserRepository } from '@modules/users/user.repository.js';

import type { TSyncUserParams } from './authentication.types.js';

@provide()
export class AuthenticationService {
  constructor(@inject(UserRepository) private readonly _userRepository: UserRepository) {}

  public async syncUser(params: TSyncUserParams): Promise<UserModel> {
    const { auth0Id, syncUserDto, isEmailVerified } = params;

    const existingUser = await this._userRepository.findByAuth0Id(auth0Id);

    if (existingUser) {
      if (existingUser.isVerified !== isEmailVerified) {
        await this._userRepository.updateSystemData(existingUser.id, {
          isVerified: isEmailVerified,
        });
      }

      const hasChanges =
        (syncUserDto.firstName && existingUser.firstName !== syncUserDto.firstName) ||
        (syncUserDto.lastName && existingUser.lastName !== syncUserDto.lastName) ||
        (syncUserDto.avatarUrl && existingUser.avatarUrl !== syncUserDto.avatarUrl);

      if (hasChanges) {
        return this._userRepository.updateProfileAndFetch(existingUser.id, {
          firstName: syncUserDto.firstName,
          lastName: syncUserDto.lastName,
          avatarUrl: syncUserDto.avatarUrl,
        });
      }

      return existingUser;
    }

    const userByEmail = await this._userRepository.findByEmail(syncUserDto.email);

    if (userByEmail) {
      if (!isEmailVerified) {
        throw new HttpError({
          statusCode: 403,
          message: ErrorMessage.ACCOUNT_LINKING_REQUIRES_VERIFIED_EMAIL,
          internalPayload: {
            code: ErrorCode.HTTP_FORBIDDEN,
            reason: 'Account linking requires verified email',
          },
        });
      }

      await this._userRepository.updateSystemData(userByEmail.id, {
        auth0Id: auth0Id,
        isVerified: true,
      });

      return this._userRepository.updateProfileAndFetch(userByEmail.id, {
        firstName: syncUserDto.firstName,
        lastName: syncUserDto.lastName,
        avatarUrl: syncUserDto.avatarUrl,
      });
    }

    return this._userRepository.createAndFetch({
      auth0Id,
      email: syncUserDto.email,
      firstName: syncUserDto.firstName,
      lastName: syncUserDto.lastName,
      avatarUrl: syncUserDto.avatarUrl,
      isVerified: isEmailVerified,
    });
  }
}
