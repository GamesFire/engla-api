import type { ApiPrefix } from '@lib/constants/routes.js';

export type ApiVersion = (typeof ApiPrefix)[Exclude<keyof typeof ApiPrefix, 'API'>];
export type ApiEndpoint = `/${string}`;
