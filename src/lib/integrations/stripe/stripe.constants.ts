/**
 * Stripe Connect core settings, regional defaults, and webhook event mappings.
 */
export const StripeConfig = {
  CURRENCY: 'gbp',
  COUNTRY: 'GB',
  ACCOUNT_TYPE: 'express' as const,
  BUSINESS_TYPE: 'individual' as const,
  CHECKOUT_MODE: 'payment' as const,
  CLEANING_FEE_PRODUCT_NAME: 'Cleaning Fee',
  DEFAULT_FLAT_FEE_QUANTITY: 1,
  CAPABILITIES: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
  LINK_TYPES: {
    ONBOARDING: 'account_onboarding' as const,
  },
  WEBHOOK_EVENTS: {
    ACCOUNT_UPDATED: 'account.updated',
    CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
    CHECKOUT_SESSION_EXPIRED: 'checkout.session.expired',
    PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
  },
} as const;
