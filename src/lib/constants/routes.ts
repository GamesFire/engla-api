export const ApiPrefix = {
  API: '/api',
  V1: '/v1',
} as const;

export const ApiRoutes = {
  ROOT: '/',
  DOCS: '/docs',
  STRIPE_WEBHOOK: '/webhooks/stripe', // Important for raw body
} as const;

export const SystemRoutes = {
  ROOT: '/',
  FAVICON: '/favicon.ico',
  ROBOTS: '/robots.txt',
  WELL_KNOWN: /^\/\.well-known\/.+$/,
  HEALTH: '/health',
} as const;
