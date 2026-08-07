export const ApiPrefix = {
  API: '/api',
  V1: '/v1',
} as const;
export type ApiPrefix = (typeof ApiPrefix)[keyof typeof ApiPrefix];

export const ApiRoutes = {
  ROOT: '/',
  ADMIN: '/admin',
  AUTH: '/auth',
  WEBHOOKS: '/webhooks',
  USERS: '/users',
  PROPERTIES: '/properties',
  AMENITIES: '/amenities',
  PERMISSIONS: '/permissions',
} as const;

export const SystemRoutes = {
  ROOT: '/',
  FAVICON: '/favicon.ico',
  ROBOTS: '/robots.txt',
  WELL_KNOWN: /^\/\.well-known\/.+$/,
  HEALTH: '/health',
} as const;
