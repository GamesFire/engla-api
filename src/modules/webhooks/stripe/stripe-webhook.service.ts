import { inject } from 'inversify';
import Stripe from 'stripe';

import { provide } from '@ioc/decorators.js';
import { StripeConfig } from '@lib/integrations/stripe/stripe.constants.js';
import { logger } from '@lib/logger.js';
import { UserService } from '@modules/users/user.service.js';

@provide()
export class StripeWebhookService {
  constructor(@inject(UserService) private readonly _userService: UserService) {}

  /**
   * Handles changes to a connected Express account.
   * Upgrades the user to HOST only when details are submitted and payouts are enabled.
   *
   * @param account - The Stripe Account object.
   */
  private async _handleAccountUpdated(account: Stripe.Account): Promise<void> {
    const isReadyForPayouts = account.details_submitted && account.payouts_enabled;

    if (!isReadyForPayouts) {
      logger.info(
        `[StripeWebhookService] Account ${account.id} updated, but KYC is not yet complete (details_submitted: ${account.details_submitted}, payouts_enabled: ${account.payouts_enabled}).`,
      );
      return;
    }

    await this._userService.completeHostOnboarding(account.id);
  }

  /**
   * Dispatches verified Stripe events to their corresponding domain handlers.
   *
   * @param event - The verified Stripe Event object.
   */
  public async processEvent(event: Stripe.Event): Promise<void> {
    logger.info(`[StripeWebhookService] Processing webhook event: ${event.type} (${event.id})`);

    switch (event.type) {
      case StripeConfig.WEBHOOK_EVENTS.ACCOUNT_UPDATED: {
        const account = event.data.object;
        await this._handleAccountUpdated(account);
        break;
      }
      default: {
        logger.debug(`[StripeWebhookService] Unhandled event type: ${event.type}`);
      }
    }
  }
}
