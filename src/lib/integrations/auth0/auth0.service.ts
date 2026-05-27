import { ManagementClient } from 'auth0';

import { provide } from '@ioc/decorators.js';
import { appConfig } from '@lib/configs/app.config.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';
import { logger } from '@lib/logger.js';
import { isAuth0ApiError } from '@utils/type-guards/is-auth0-api-error.js';

@provide()
export class Auth0Service {
  private _managementClient: ManagementClient;

  constructor() {
    const domain = new URL(appConfig.AUTH0_ISSUER_BASE_URL).hostname;

    this._managementClient = new ManagementClient({
      domain,
      clientId: appConfig.AUTH0_M2M_CLIENT_ID,
      clientSecret: appConfig.AUTH0_M2M_CLIENT_SECRET,
    });
  }

  /**
   * Updates the user's custom avatar URL in Auth0's user_metadata.
   *
   * @param auth0Id - User ID in Auth0.
   * @param avatarUrl - The new Cloudinary secure URL.
   * @throws Will throw an HTTP 502 error if the update fails.
   */
  public async updateUserAvatar(auth0Id: string, avatarUrl: string): Promise<void> {
    try {
      await this._managementClient.users.update(auth0Id, {
        user_metadata: { custom_picture: avatarUrl },
      });
      logger.info(`[Auth0Service] Successfully updated custom_picture for user ${auth0Id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      logger.error(
        `[Auth0Service] Failed to update avatar in Auth0 for user ${auth0Id}: ${errorMessage || 'Unknown error'}`,
      );

      throw new HttpError({
        statusCode: 502,
        message: ErrorMessages.INTEGRATION.IDENTITY_PROVIDER,
        internalPayload: { code: ErrorCodes.INTEGRATION.IDENTITY_PROVIDER },
      });
    }
  }

  /**
   * Deletes a user from the Auth0 database.
   *
   * If the user is not found in Auth0 (404), the method will log a warning and return without throwing an error.
   *
   * @param auth0Id - User ID in Auth0 (e.g., "auth0|123456789").
   * @returns A Promise that resolves when the user is deleted from Auth0.
   * @throws Will throw an HTTP 502 error if the deletion fails (excluding 404).
   */
  public async deleteUser(auth0Id: string): Promise<void> {
    try {
      await this._managementClient.users.delete(auth0Id);
      logger.info(`[Auth0Service] User ${auth0Id} successfully deleted from Auth0.`);
    } catch (error: unknown) {
      if (isAuth0ApiError(error) && error.statusCode === 404) {
        logger.warn(
          `[Auth0Service] User ${auth0Id} not found in Auth0. Proceeding to local deletion...`,
        );
        return;
      }

      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      logger.error(
        `[Auth0Service] Failed to delete user ${auth0Id}: ${errorMessage || 'Unknown error'}`,
      );

      throw new HttpError({
        statusCode: 502,
        message: ErrorMessages.INTEGRATION.IDENTITY_PROVIDER,
        internalPayload: { code: ErrorCodes.INTEGRATION.IDENTITY_PROVIDER },
      });
    }
  }
}
