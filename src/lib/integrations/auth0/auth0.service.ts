import { ManagementClient } from 'auth0';

import { provide } from '@ioc/decorators.js';
import { appConfig } from '@lib/configs/app.config.js';
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
   * Deletes a user from the Auth0 database.
   *
   * If the user is not found in Auth0 (404), the method will log a warning and return without throwing an error.
   * If any other error occurs, the method will log an error and re-throw the error.
   *
   * @param {string} auth0Id - User ID in Auth0 (e.g., "auth0|123456789").
   * @returns {Promise<void>} A Promise that resolves when the user is deleted from Auth0.
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

      logger.error(
        `[Auth0Service] Failed to delete user ${auth0Id}:`,
        error instanceof Error ? error.message : error,
      );
      throw error;
    }
  }
}
