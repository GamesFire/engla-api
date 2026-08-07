import { Router } from 'express';

import { createPublicStripeWebhookRouter } from './stripe/stripe-webhook.routes.js';

const WebhookSubRoutes = {
  STRIPE: '/stripe',
} as const;

export function createWebhooksRouter(): Router {
  const router = Router();

  router.use(WebhookSubRoutes.STRIPE, createPublicStripeWebhookRouter());

  return router;
}
