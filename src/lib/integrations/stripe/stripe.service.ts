import Stripe from 'stripe';

import { provide } from '@ioc/decorators.js';
import { appConfig } from '@lib/configs/app.config.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';
import { logger } from '@lib/logger.js';

import { StripeConfig } from './stripe.constants.js';
import type { CreateExpressAccountParams } from './stripe.types.js';

@provide()
export class StripeService {
  private readonly _stripe: Stripe;

  constructor() {
    this._stripe = new Stripe(appConfig.STRIPE_SECRET_KEY);
  }

  /**
   * Creates a blank Stripe Express connected account for a potential host,
   * prefilling their personal information (name, phone, email) to improve KYC UX.
   *
   * @param params - The user's validated personal details.
   * @returns A Promise resolving to the unique Stripe Account ID (e.g., `acct_12345`).
   * @throws Will throw an HTTP 502 error if the Stripe API request fails.
   */
  public async createExpressAccount(params: CreateExpressAccountParams): Promise<string> {
    try {
      const account = await this._stripe.accounts.create({
        type: StripeConfig.ACCOUNT_TYPE,
        country: StripeConfig.COUNTRY,
        email: params.email,
        business_type: StripeConfig.BUSINESS_TYPE,
        individual: {
          first_name: params.firstName,
          last_name: params.lastName,
          phone: params.phone,
        },
        capabilities: StripeConfig.CAPABILITIES,
      });

      logger.info(
        `[StripeService] Created Express account: ${account.id} for email: ${params.email}`,
      );

      return account.id;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      logger.error(
        `[StripeService] Failed to create Express account for ${params.email}: ${errorMessage || 'Unknown error'}`,
      );

      throw new HttpError({
        statusCode: 502,
        message: ErrorMessages.INTEGRATION.PAYMENT_PROVIDER,
        internalPayload: { code: ErrorCodes.INTEGRATION.PAYMENT_PROVIDER },
      });
    }
  }

  /**
   * Generates a temporary, single-use Account Link for KYC verification on Stripe's hosted pages.
   *
   * @param accountId - The Stripe Account ID of the host (e.g., `acct_12345`).
   * @returns A Promise resolving to the secure URL where the user should be redirected.
   * @throws Will throw an HTTP 502 error if the Account Link generation fails.
   */
  public async createOnboardingLink(accountId: string): Promise<string> {
    try {
      const accountLink = await this._stripe.accountLinks.create({
        account: accountId,
        refresh_url: appConfig.STRIPE_REFRESH_URL,
        return_url: appConfig.STRIPE_RETURN_URL,
        type: StripeConfig.LINK_TYPES.ONBOARDING,
      });

      logger.info(`[StripeService] Generated onboarding link for account: ${accountId}`);
      return accountLink.url;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      logger.error(
        `[StripeService] Failed to create Account Link for ${accountId}: ${errorMessage || 'Unknown error'}`,
      );

      throw new HttpError({
        statusCode: 502,
        message: ErrorMessages.INTEGRATION.PAYMENT_PROVIDER,
        internalPayload: { code: ErrorCodes.INTEGRATION.PAYMENT_PROVIDER },
      });
    }
  }

  /**
   * Verifies and constructs a Stripe webhook event from the raw request payload.
   *
   * This is a critical security step to ensure that incoming webhook requests
   * actually originated from Stripe and have not been tampered with.
   *
   * @param payload - The raw Buffer of the incoming HTTP request body.
   * @param signature - The `stripe-signature` header value from the request.
   * @returns The parsed and verified `Stripe.Event` object.
   * @throws Will throw an HTTP 400 error if the cryptographic signature is invalid.
   */
  public constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    try {
      return this._stripe.webhooks.constructEvent(
        payload,
        signature,
        appConfig.STRIPE_WEBHOOK_SECRET,
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      logger.error(
        `[StripeService] Webhook signature verification failed: ${errorMessage || 'Unknown error'}`,
      );

      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.INTEGRATION.PAYMENT_WEBHOOK_INVALID,
        internalPayload: { code: ErrorCodes.INTEGRATION.PAYMENT_WEBHOOK_INVALID },
      });
    }
  }
}
