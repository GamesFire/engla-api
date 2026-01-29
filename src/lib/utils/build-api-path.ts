import type { ApiEndpoint, ApiVersion } from '@app/types/api.types.js';

import { ApiPrefix } from '../constants/routes.js';

/**
 * Constructs a full API path by combining the base API prefix, version, and endpoint path.
 * Automatically handles duplicate slashes between segments.
 *
 * @param version - The API version (e.g., '/v1').
 * @param path - The endpoint path, starting with a slash (e.g., '/users', '/auth/login').
 *
 * @returns The fully qualified API path string.
 *
 * @example
 * buildApiPath(ApiPrefix.V1, '/users')      // -> '/api/v1/users'
 * buildApiPath(ApiPrefix.V1, '/users/123')  // -> '/api/v1/users/123'
 */
export function buildApiPath(version: ApiVersion, path: ApiEndpoint): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return `${ApiPrefix.API}${version}/${cleanPath}`;
}
