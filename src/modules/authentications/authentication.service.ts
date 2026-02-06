import { inject } from 'inversify';

import { ErrorCode, ErrorMessage } from '@app/lib/constants/errors.js';
import { provide } from '@ioc/decorators.js';
import { UserModel } from '@lib/db/models/users/user.model.js';
import { HttpError } from '@lib/errors/http.error.js';
import { UserRepository } from '@modules/users/user.repository.js';

import type { TSyncUserParams } from './authentication.types.js';

@provide()
export class AuthenticationService {
  constructor(@inject(UserRepository) private readonly _userRepository: UserRepository) {}

  public async syncUser(params: TSyncUserParams): Promise<UserModel> {
    const { auth0Id, dto, isEmailVerified } = params;

    const existingUser = await this._userRepository.findByAuth0Id(auth0Id);

    if (existingUser) {
      if (existingUser.isVerified !== isEmailVerified) {
        await this._userRepository.updateSystemData(existingUser.id, {
          isVerified: isEmailVerified,
        });
      }

      const hasChanges =
        (dto.firstName && existingUser.firstName !== dto.firstName) ||
        (dto.lastName && existingUser.lastName !== dto.lastName) ||
        (dto.avatarUrl && existingUser.avatarUrl !== dto.avatarUrl);

      if (hasChanges) {
        return this._userRepository.updateProfileAndFetch(existingUser.id, {
          firstName: dto.firstName,
          lastName: dto.lastName,
          avatarUrl: dto.avatarUrl,
        });
      }

      return existingUser;
    }

    const userByEmail = await this._userRepository.findByEmail(dto.email);

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
        firstName: dto.firstName,
        lastName: dto.lastName,
        avatarUrl: dto.avatarUrl,
      });
    }

    return this._userRepository.createAndFetch({
      auth0Id,
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      avatarUrl: dto.avatarUrl,
      isVerified: isEmailVerified,
    });
  }
}
