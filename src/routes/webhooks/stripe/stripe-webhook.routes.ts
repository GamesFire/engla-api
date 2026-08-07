import express, { Router } from 'express';

import { HttpContentType } from '@lib/constants/http.js';
import { RateLimiters } from '@lib/middlewares/rate-limit/rate-limiters.js';

import { StripeWebhookController } from './stripe-webhook.controller.js';

const PublicStripeWebhookRoutes = {
  ROOT: '/',
} as const;

export function createPublicStripeWebhookRouter(): Router {
  const router = Router();
  const controller = ioc.get(StripeWebhookController);

  router.post(
    PublicStripeWebhookRoutes.ROOT,
    RateLimiters.WEBHOOKS.STRIPE,
    express.raw({ type: HttpContentType.JSON }),
    controller.handleWebhook,
  );

  return router;
}
