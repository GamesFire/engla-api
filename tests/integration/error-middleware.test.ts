/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { HttpError } from '@lib/errors/http.error.js';
import { errorMiddleware } from '@lib/middlewares/error.middleware.js';

describe('Error Middleware Integration', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Test route that throws HttpError
    app.get('/http-error', (_req, _res) => {
      throw new HttpError({
        message: 'Resource not found',
        statusCode: 404,
      });
    });

    // Test route that throws ZodError
    app.get('/validation-error', async (_req, _res) => {
      const schema = z.object({ name: z.string() });
      await schema.parseAsync({ name: 123 });
    });

    // Test route that throws generic Error
    app.get('/generic-error', (_req, _res) => {
      throw new Error('Generic error message');
    });

    // Test route that returns invalid JSON (simulated)
    app.post('/json-error', (req: Request & { traceID?: string }, _res, next) => {
      req.traceID = 'test-trace-id';
      const error = new SyntaxError('Unexpected token');
      (error as any).status = 400;
      (error as any).body = {};
      next(error);
    });

    // Test route that throws HttpError with internalPayload
    app.get('/error-with-payload', (_req, _res) => {
      throw new HttpError({
        message: 'Bad request',
        statusCode: 400,
        internalPayload: { userId: 123, action: 'update' },
      });
    });

    // Test route that throws HttpError with originalError
    app.get('/error-with-original', (_req, _res) => {
      const original = new Error('Database connection failed');
      throw new HttpError({
        message: 'Service unavailable',
        statusCode: 503,
        originalError: original,
      });
    });

    // Wrapper to handle async errors
    app.use((err: any, _req: Request, _res: Response, next: NextFunction) => {
      next(err);
    });

    // Error middleware
    app.use(errorMiddleware);
  });

  it('should handle HttpError correctly', async () => {
    const response = await request(app).get('/http-error');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message', 'Resource not found');
    expect(response.body).toHaveProperty('code');
    expect(response.body).toHaveProperty('traceID');
  });

  it('should handle validation errors with details', async () => {
    const response = await request(app).get('/validation-error');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('validation');
    expect(Array.isArray(response.body.validation)).toBe(true);
  });

  it('should handle generic errors', async () => {
    const response = await request(app).get('/generic-error');

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('message');
  });

  it('should include traceID in error response', async () => {
    const response = await request(app).get('/http-error');

    expect(response.body).toHaveProperty('traceID');
    expect(typeof response.body.traceID).toBe('string');
    expect(response.body.traceID.length).toBeGreaterThan(0);
  });

  it('should handle errors with internalPayload', async () => {
    const response = await request(app).get('/error-with-payload');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'error');
    expect(response.body).toHaveProperty('code');
  });

  it('should handle errors with originalError', async () => {
    const response = await request(app).get('/error-with-original');

    expect(response.status).toBe(503);
    expect(response.body).toHaveProperty('status', 'error');
  });
});
