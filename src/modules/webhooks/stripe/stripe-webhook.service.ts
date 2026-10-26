import { inject } from 'inversify';
import Stripe from 'stripe';

import { provide } from '@ioc/decorators.js';
import { StripeConfig } from '@lib/integrations/stripe/stripe.constants.js';
import { logger } from '@lib/logger.js';
import { BookingService } from '@modules/bookings/booking.service.js';
import { UserService } from '@modules/users/user.service.js';

@provide()
export class StripeWebhookService {
  constructor(
    @inject(UserService) private readonly _userService: UserService,
    @inject(BookingService) private readonly _bookingService: BookingService,
  ) {}

  /**
   * Handles changes to a connected Express account.
   * Upgrades the user to HOST only when details are submitted and payouts are enabled.
   *
   * @param account - The Stripe Account object.
   * @returns A Promise that resolves when the account update has been processed.
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
   * Handles completed Checkout Sessions for property bookings.
   *
   * @param session - The Stripe Checkout Session object.
   * @returns A Promise that resolves when the booking payment confirmation is complete.
   */
  private async _handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : (session.payment_intent?.id ?? null);

    const rawBookingId = session.metadata?.bookingId ?? session.client_reference_id;
    const bookingIdFromMetadata = rawBookingId ? parseInt(rawBookingId, 10) : undefined;

    await this._bookingService.confirmBookingPayment({
      sessionId: session.id,
      paymentIntentId,
      bookingIdFromMetadata:
        bookingIdFromMetadata && !Number.isNaN(bookingIdFromMetadata)
          ? bookingIdFromMetadata
          : undefined,
    });
  }

  /**
   * Handles expired Checkout Sessions to release blocked property dates.
   *
   * @param session - The Stripe Checkout Session object.
   * @returns A Promise that resolves when the pending booking has been marked as expired.
   */
  private async _handleCheckoutSessionExpired(session: Stripe.Checkout.Session): Promise<void> {
    await this._bookingService.expirePendingBookingBySessionId(session.id);
  }

  /**
   * Handles failed PaymentIntents.
   *
   * @param paymentIntent - The Stripe PaymentIntent object.
   * @returns A Promise that resolves when the failed payment attempt has been logged.
   */
  private async _handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const rawBookingId = paymentIntent.metadata?.bookingId;
    const bookingIdFromMetadata = rawBookingId ? parseInt(rawBookingId, 10) : undefined;

    await this._bookingService.handleFailedPaymentAttempt(
      paymentIntent.id,
      bookingIdFromMetadata && !Number.isNaN(bookingIdFromMetadata)
        ? bookingIdFromMetadata
        : undefined,
    );
  }

  /**
   * Dispatches verified Stripe events to their corresponding domain handlers.
   *
   * @param event - The verified Stripe Event object.
   * @returns A Promise that resolves when the webhook event has been processed.
   */
  public async processEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case StripeConfig.WEBHOOK_EVENTS.ACCOUNT_UPDATED: {
        logger.info(`[StripeWebhookService] Processing webhook event: ${event.type} (${event.id})`);
        const account = event.data.object;
        await this._handleAccountUpdated(account);
        break;
      }
      case StripeConfig.WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED: {
        logger.info(`[StripeWebhookService] Processing webhook event: ${event.type} (${event.id})`);
        const session = event.data.object;
        await this._handleCheckoutSessionCompleted(session);
        break;
      }
      case StripeConfig.WEBHOOK_EVENTS.CHECKOUT_SESSION_EXPIRED: {
        logger.info(`[StripeWebhookService] Processing webhook event: ${event.type} (${event.id})`);
        const session = event.data.object;
        await this._handleCheckoutSessionExpired(session);
        break;
      }
      case StripeConfig.WEBHOOK_EVENTS.PAYMENT_INTENT_PAYMENT_FAILED: {
        logger.info(`[StripeWebhookService] Processing webhook event: ${event.type} (${event.id})`);
        const paymentIntent = event.data.object;
        await this._handlePaymentIntentFailed(paymentIntent);
        break;
      }
      default: {
        logger.debug(
          `[StripeWebhookService] Ignoring unhandled webhook event: ${event.type} (${event.id})`,
        );
      }
    }
  }
}
