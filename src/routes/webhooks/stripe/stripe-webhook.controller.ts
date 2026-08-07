import type { Request, Response } from 'express';
import { inject } from 'inversify';

import { provide } from '@ioc/decorators.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpHeader } from '@lib/constants/http.js';
import { HttpError } from '@lib/errors/http.error.js';
import { StripeService } from '@lib/integrations/stripe/stripe.service.js';
import { StripeWebhookService } from '@modules/webhooks/stripe/stripe-webhook.service.js';
import { toBuffer } from '@utils/data.js';

@provide()
export class StripeWebhookController {
  constructor(
    @inject(StripeService) private readonly _stripeService: StripeService,
    @inject(StripeWebhookService) private readonly _stripeWebhookService: StripeWebhookService,
  ) {
    this.handleWebhook = this.handleWebhook.bind(this);
  }

  public async handleWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers[HttpHeader.STRIPE_SIGNATURE];

    if (!signature || typeof signature !== 'string') {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.INTEGRATION.PAYMENT_WEBHOOK_INVALID,
        internalPayload: { code: ErrorCodes.INTEGRATION.PAYMENT_WEBHOOK_INVALID },
      });
    }

    const payload = toBuffer(req.body);
    const event = this._stripeService.constructWebhookEvent(payload, signature);

    await this._stripeWebhookService.processEvent(event);

    res.status(200).json({ received: true });
  }
}
