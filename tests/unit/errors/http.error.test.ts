import { describe, expect, it } from 'vitest';

import { HttpError } from '@lib/errors/http.error.js';

describe('HttpError', () => {
  it('should create an HttpError with required properties', () => {
    const error = new HttpError({
      message: 'Not Found',
      statusCode: 404,
    });

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Not Found');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('HttpError');
  });

  it('should create an HttpError with internalPayload', () => {
    const payload = { userId: 123, action: 'delete' };
    const error = new HttpError({
      message: 'Access Denied',
      statusCode: 403,
      internalPayload: payload,
    });

    expect(error.internalPayload).toEqual(payload);
  });

  it('should create an HttpError with originalError', () => {
    const originalError = new Error('Database connection failed');
    const error = new HttpError({
      message: 'Service Unavailable',
      statusCode: 503,
      originalError,
    });

    expect(error.originalError).toBe(originalError);
  });

  it('should create an HttpError with all properties', () => {
    const originalError = new Error('Original error');
    const payload = { details: 'error details' };

    const error = new HttpError({
      message: 'Bad Request',
      statusCode: 400,
      internalPayload: payload,
      originalError,
    });

    expect(error.message).toBe('Bad Request');
    expect(error.statusCode).toBe(400);
    expect(error.internalPayload).toEqual(payload);
    expect(error.originalError).toBe(originalError);
  });

  it('should support various HTTP status codes', () => {
    const statusCodes = [400, 401, 403, 404, 409, 422, 429, 500, 502, 503];

    statusCodes.forEach((statusCode) => {
      const error = new HttpError({
        message: `Error ${statusCode}`,
        statusCode,
      });

      expect(error.statusCode).toBe(statusCode);
    });
  });

  it('should maintain proper prototype chain', () => {
    const error = new HttpError({
      message: 'Test',
      statusCode: 500,
    });

    expect(error instanceof HttpError).toBe(true);
    expect(error instanceof Error).toBe(true);
    expect(Object.getPrototypeOf(error)).toBe(HttpError.prototype);
  });
});
