/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { validateRequest } from '@lib/middlewares/validate-request.middleware.js';

describe('validateRequest Middleware', () => {
  it('should validate body schema', async () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const middleware = validateRequest({ body: schema });

    const req = { body: { name: 'John', age: 30 } } as any;
    const res = {} as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(req.body).toEqual({ name: 'John', age: 30 });
    expect(next).toHaveBeenCalledWith();
  });

  it('should validate query schema', async () => {
    const schema = z.object({ page: z.coerce.number() });
    const middleware = validateRequest({ query: schema });

    const req = { query: { page: '1' } } as any;
    const res = {} as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(req.query).toEqual({ page: 1 });
    expect(next).toHaveBeenCalledWith();
  });

  it('should validate params schema', async () => {
    const schema = z.object({ id: z.string().uuid() });
    const middleware = validateRequest({ params: schema });

    const req = { params: { id: '123e4567-e89b-12d3-a456-426614174000' } } as any;
    const res = {} as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(req.params).toEqual({ id: '123e4567-e89b-12d3-a456-426614174000' });
    expect(next).toHaveBeenCalledWith();
  });

  it('should handle validation error', async () => {
    const schema = z.object({ name: z.string() });
    const middleware = validateRequest({ body: schema });

    const req = { body: { name: 123 } } as any;
    const res = {} as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should validate multiple schemas', async () => {
    const bodySchema = z.object({ name: z.string() });
    const querySchema = z.object({ page: z.coerce.number() });
    const paramsSchema = z.object({ id: z.string() });

    const middleware = validateRequest({
      body: bodySchema,
      query: querySchema,
      params: paramsSchema,
    });

    const req = {
      body: { name: 'John' },
      query: { page: '1' },
      params: { id: 'abc123' },
    } as any;
    const res = {} as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(req.body).toEqual({ name: 'John' });
    expect(req.query).toEqual({ page: 1 });
    expect(req.params).toEqual({ id: 'abc123' });
    expect(next).toHaveBeenCalledWith();
  });

  it('should skip validation if schema is not provided', async () => {
    const middleware = validateRequest({});

    const req = { body: {}, query: {}, params: {} } as any;
    const res = {} as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should pass validation error to next middleware', async () => {
    const schema = z.object({ email: z.string().trim().pipe(z.email()) });
    const middleware = validateRequest({ body: schema });

    const req = { body: { email: 'not-an-email' } } as any;
    const res = {} as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should coerce types correctly', async () => {
    const schema = z.object({
      count: z.coerce.number(),
      active: z.coerce.boolean(),
    });
    const middleware = validateRequest({ body: schema });

    const req = { body: { count: '42', active: 'true' } } as any;
    const res = {} as any;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(req.body).toEqual({ count: 42, active: true });
    expect(next).toHaveBeenCalledWith();
  });
});
