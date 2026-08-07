/**
 * Stripe Connect core settings, regional defaults, and webhook event mappings.
 */
export const StripeConfig = {
  CURRENCY: 'gbp',
  COUNTRY: 'GB',
  ACCOUNT_TYPE: 'express' as const,
  BUSINESS_TYPE: 'individual' as const,
  CAPABILITIES: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
  LINK_TYPES: {
    ONBOARDING: 'account_onboarding' as const,
  },
  WEBHOOK_EVENTS: {
    ACCOUNT_UPDATED: 'account.updated',
  },
} as const;
