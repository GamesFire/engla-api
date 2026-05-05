import { inject } from 'inversify';

import type { PaginatedResponse } from '@app/interfaces/pagination.interface.js';
import { provide } from '@ioc/decorators.js';
import { appConfig } from '@lib/configs/app.config.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';
import { Auth0Service } from '@lib/integrations/auth0/auth0.service.js';
import { CloudinaryConfig } from '@lib/integrations/cloudinary/cloudinary.constants.js';
import { CloudinaryService } from '@lib/integrations/cloudinary/cloudinary.service.js';
import { logger } from '@lib/logger.js';
import { type User } from '@models/users/user.model.js';
import { UserRepository } from '@modules/users/user.repository.js';
import type { AdminUpdateUserBodyDto, UpdateUserBodyDto } from '@routes/users/user.validation.js';

import { UserMedia } from './user.constants.js';
import type { FindUserOptions, GetUsersParams, UploadUserAvatarParams } from './user.types.js';

@provide()
export class UserService {
  constructor(
    @inject(UserRepository) private readonly _userRepository: UserRepository,
    @inject(Auth0Service) private readonly _auth0Service: Auth0Service,
    @inject(CloudinaryService) private readonly _cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Helper method to generate a deterministic Cloudinary ID for avatars.
   *
   * @param userId - The ID of the user.
   * @returns The generated Cloudinary ID.
   */
  private _generateAvatarPublicId(userId: number): string {
    return `${UserMedia.AVATAR_PUBLIC_ID_PREFIX}${userId}`;
  }

  /**
   * Helper method to generate the full Cloudinary public ID (including folders).
   *
   * @param userId - The ID of the user.
   * @returns The full Cloudinary public ID.
   */
  private _getFullAvatarPublicId(userId: number): string {
    const customId = this._generateAvatarPublicId(userId);
    return `${appConfig.CLOUDINARY_BASE_FOLDER}/${CloudinaryConfig.FOLDERS.AVATARS}/${customId}`;
  }

  /**
   * Helper method to silently delete an avatar from Cloudinary if it exists.
   * We do not throw errors here to prevent blocking the account deletion flow.
   *
   * @param user - The user whose avatar to delete.
   * @returns A promise that resolves when the deletion is complete.
   */
  private async _silentlyDeleteAvatar(user: User): Promise<void> {
    if (user.avatarUrl && user.avatarUrl.includes(CloudinaryConfig.DOMAIN)) {
      const fullPublicId = this._getFullAvatarPublicId(user.id);

      try {
        await this._cloudinaryService.deleteImage(fullPublicId);
      } catch {
        logger.warn(
          `[UserService] Failed to delete avatar for user ${user.id} during account deletion. Storage might contain an orphaned file.`,
        );
      }
    }
  }

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

  public async uploadAvatar(params: UploadUserAvatarParams): Promise<User> {
    const { userId, auth0Id, fileBuffer } = params;

    const customPublicId = this._generateAvatarPublicId(userId);

    const uploadResult = await this._cloudinaryService.uploadImage({
      fileBuffer,
      targetFolder: CloudinaryConfig.FOLDERS.AVATARS,
      customPublicId,
    });

    this._auth0Service.updateUserAvatar(auth0Id, uploadResult.url).catch(() => {
      logger.warn(
        `[UserService] Auth0 sync failed for avatar update (User: ${userId}). This is non-fatal.`,
      );
    });

    return this._userRepository.updateProfileAndFetchById({
      userId,
      data: { avatarUrl: uploadResult.url },
    });
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
    await this._silentlyDeleteAvatar(user);
    await this._userRepository.softDeleteAndFetchById(userId);
  }

  public async deleteUserByAdmin(userId: number): Promise<void> {
    const user = await this._getExistingUser(userId, { modifiers: null });

    await this._auth0Service.deleteUser(user.auth0Id);
    await this._silentlyDeleteAvatar(user);
    await this._userRepository.softDeleteAndFetchById(userId);
  }
}
