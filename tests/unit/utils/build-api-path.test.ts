import { describe, expect, it } from 'vitest';

import { ApiPrefix } from '@lib/constants/routes.js';
import { buildApiPath } from '@utils/build-api-path.js';

describe('buildApiPath', () => {
  it('should build a simple API path', () => {
    const result = buildApiPath(ApiPrefix.V1, '/users');
    expect(result).toBe('/api/v1/users');
  });

  it('should build an API path with nested endpoints', () => {
    const result = buildApiPath(ApiPrefix.V1, '/users/123');
    expect(result).toBe('/api/v1/users/123');
  });

  it('should build an API path with complex nested structure', () => {
    const result = buildApiPath(ApiPrefix.V1, '/users/123/properties/456/bookings');
    expect(result).toBe('/api/v1/users/123/properties/456/bookings');
  });

  it('should handle paths without ApiPrefix type', () => {
    const result = buildApiPath('/v1', '/users/123/profile');
    expect(result).toBe('/api/v1/users/123/profile');
  });

  it('should handle paths with special characters', () => {
    const result = buildApiPath(ApiPrefix.V1, '/auth/callback');
    expect(result).toBe('/api/v1/auth/callback');
  });

  it('should not create double slashes', () => {
    const result = buildApiPath(ApiPrefix.V1, '/users');
    expect(result).not.toContain('//');
    expect(result).toBe('/api/v1/users');
  });

  it('should build webhook paths correctly', () => {
    const result = buildApiPath(ApiPrefix.V1, '/webhooks/stripe');
    expect(result).toBe('/api/v1/webhooks/stripe');
  });

  it('should build authentication paths correctly', () => {
    const result = buildApiPath(ApiPrefix.V1, '/auth/login');
    expect(result).toBe('/api/v1/auth/login');
  });
});
