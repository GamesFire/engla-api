import { describe, expect, it } from 'vitest';

import { loginBodySchema } from '@routes/authentications/authentication.validation.js';

describe('loginBodySchema', () => {
  it('parses and normalizes a minimal valid payload', () => {
    const input = { email: '  USER@Example.COM ' };
    const parsed = loginBodySchema.parse(input);
    expect(parsed.email).toBe('user@example.com');
  });

  it('parses full valid payload and formats names', () => {
    const input = {
      email: 'alice@example.com',
      firstName: 'jAnE',
      lastName: 'doE',
      avatarUrl: 'https://example.com/avatar.png',
    };
    const parsed = loginBodySchema.parse(input);
    expect(parsed.firstName).toBe('Jane');
    expect(parsed.lastName).toBe('Doe');
    expect(parsed.avatarUrl).toBe('https://example.com/avatar.png');
  });

  it('rejects invalid email', () => {
    expect(() => loginBodySchema.parse({ email: 'not-an-email' })).toThrow();
  });

  it('rejects avatar URLs that are not HTTPS', () => {
    expect(() =>
      loginBodySchema.parse({
        email: 'bob@example.com',
        avatarUrl: 'http://example.com/avatar.png',
      }),
    ).toThrow();
  });

  it('rejects names with invalid characters', () => {
    expect(() =>
      loginBodySchema.parse({
        email: 'test@example.com',
        firstName: 'John$',
      }),
    ).toThrow();
  });
});
