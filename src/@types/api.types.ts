import type { ApiPrefix } from '@lib/constants/routes.js';

export type ApiVersion = Exclude<ApiPrefix, typeof ApiPrefix.API>;
export type ApiEndpoint = `/${string}`;
