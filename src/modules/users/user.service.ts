import { inject } from 'inversify';

import type { PaginatedResponse } from '@app/interfaces/pagination.interface.js';
import { provide } from '@ioc/decorators.js';
import { appConfig } from '@lib/configs/app.config.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';
import { Auth0Service } from '@lib/integrations/auth0/auth0.service.js';
import { CloudinaryConfig } from '@lib/integrations/cloudinary/cloudinary.constants.js';
import { CloudinaryService } from '@lib/integrations/cloudinary/cloudinary.service.js';
import { StripeService } from '@lib/integrations/stripe/stripe.service.js';
import { logger } from '@lib/logger.js';
import { type User, UserRole } from '@models/users/user.model.js';
import { UserRepository } from '@modules/users/user.repository.js';
import type {
  AdminSyncPermissionsBodyDto,
  AdminUpdateUserBodyDto,
  UpdateUserBodyDto,
} from '@routes/users/user.validation.js';

import { UserMedia, UserRules } from './user.constants.js';
import type {
  FindUserOptions,
  GetUsersParams,
  HostOnboardingReadyUser,
  InitiateHostOnboardingResult,
  UploadUserAvatarParams,
} from './user.types.js';

@provide()
export class UserService {
  constructor(
    @inject(UserRepository) private readonly _userRepository: UserRepository,
    @inject(Auth0Service) private readonly _auth0Service: Auth0Service,
    @inject(CloudinaryService) private readonly _cloudinaryService: CloudinaryService,
    @inject(StripeService) private readonly _stripeService: StripeService,
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

  /**
   * Validates that a user's profile meets the minimum requirements for host onboarding.
   * Ensures all mandatory personal details required by the payment provider (Stripe KYC) are present.
   *
   * @param user - The base user entity to validate.
   * @throws Will throw a 400 Bad Request detailing the missing required fields if the profile is incomplete.
   */
  private _assertProfileComplete(user: User): asserts user is HostOnboardingReadyUser {
    const missingFields = UserRules.REQUIRED_FOR_ONBOARDING.filter(
      (field) => !user[field],
    ) as string[];

    if (missingFields.length > 0) {
      throw new HttpError({
        statusCode: 400,
        message: `${ErrorMessages.USERS.PROFILE_INCOMPLETE}: ${missingFields.join(', ')}`,
        internalPayload: {
          code: ErrorCodes.USERS.PROFILE_INCOMPLETE,
          missingFields,
        },
      });
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

  public async getUserProfileById(userId: number): Promise<User> {
    return this._getExistingUser(userId);
  }

  public async getMyProfile(userId: number, role: UserRole): Promise<User> {
    return this._getExistingUser(userId, {
      withPermissions: role === UserRole.ADMIN,
    });
  }

  public async getUserByIdForAdmin(userId: number): Promise<User> {
    return this._getExistingUser(userId, {
      includeDeleted: true,
    });
  }

  public async getUsers(params: GetUsersParams): Promise<PaginatedResponse<User>> {
    return this._userRepository.getUsers(params);
  }

  public async getUserPermissions(userId: number): Promise<string[]> {
    await this._getExistingUser(userId, { includeDeleted: true });

    return this._userRepository.getUserPermissions(userId);
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

  public async syncUserPermissionsByAdmin(
    userId: number,
    dto: AdminSyncPermissionsBodyDto,
  ): Promise<string[]> {
    await this._getExistingUser(userId, { includeDeleted: true });

    return this._userRepository.syncUserPermissions(userId, dto.permissions);
  }

  /**
   * Initiates the Stripe Connect onboarding flow for a user to become a host.
   *
   * Validates prerequisites (verified email, complete personal profile) and
   * generates an idempotency-safe account link for KYC verification.
   *
   * @param userId - The ID of the user initiating onboarding.
   * @returns A Promise resolving to the secure Stripe onboarding URL.
   * @throws Will throw HTTP 400 if prerequisites are not met.
   */
  public async initiateHostOnboarding(userId: number): Promise<InitiateHostOnboardingResult> {
    const user = await this._getExistingUser(userId, { modifiers: null });

    if (!user.isVerified) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.USERS.NOT_VERIFIED,
        internalPayload: { code: ErrorCodes.USERS.NOT_VERIFIED },
      });
    }

    this._assertProfileComplete(user);

    let accountId = user.stripeAccountId;

    if (!accountId) {
      accountId = await this._stripeService.createExpressAccount({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      });

      await this._userRepository.updateSystemDataAndFetchById({
        userId,
        data: { stripeAccountId: accountId },
      });
    }

    const url = await this._stripeService.createOnboardingLink(accountId);

    return { url };
  }

  /**
   * Upgrades a user to HOST status upon successful Stripe Connect KYC completion.
   * This method is idempotent and safe against duplicate webhook deliveries.
   *
   * @param stripeAccountId - The Stripe account ID received from the webhook.
   * @returns A Promise that resolves when the user status is updated.
   */
  public async completeHostOnboarding(stripeAccountId: string): Promise<void> {
    const user = await this._userRepository.findByStripeAccountId(stripeAccountId, {
      modifiers: null,
    });

    if (!user) {
      logger.warn(
        `[UserService] Webhook received for unknown Stripe account ID: ${stripeAccountId}`,
      );
      return;
    }

    if (user.stripeOnboardingCompleted && user.role === UserRole.HOST) {
      logger.info(
        `[UserService] User ${user.id} is already an active HOST. Ignoring duplicate webhook.`,
      );
      return;
    }

    await this._userRepository.updateSystemDataAndFetchById({
      userId: user.id,
      data: {
        stripeOnboardingCompleted: true,
        role: UserRole.HOST,
      },
    });

    logger.info(`[UserService] User ${user.id} (${user.email}) successfully upgraded to HOST!`);
  }
}
