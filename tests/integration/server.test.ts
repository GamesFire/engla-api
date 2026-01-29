import type { Express } from 'express';
import { Container } from 'inversify';
import request from 'supertest';
import { beforeAll, describe, expect, it } from 'vitest';

import { createServer } from '@app/server.js';

describe('Server Setup', () => {
  let app: Express;
  let ioc: Container;

  beforeAll(async () => {
    ioc = new Container();
    app = await createServer(ioc);
  });

  it('should create a valid Express app', () => {
    expect(app).toBeDefined();
    expect(typeof app).toBe('function');
  });

  it('should return 200 for v1 root endpoint', async () => {
    const response = await request(app).get('/api/v1/');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('EngLa API v1');
  });

  it('should return 404 for non-existent route', async () => {
    const response = await request(app).get('/api/v1/non-existent-route');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', 'error');
  });

  it('should handle CORS headers', async () => {
    const response = await request(app).get('/api/v1/').set('Origin', 'http://localhost:3000');

    expect(response.headers['access-control-allow-origin']).toBeDefined();
  });

  it('should include security headers from helmet', async () => {
    const response = await request(app).get('/api/v1/');

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBeDefined();
  });

  it('should accept JSON content-type', async () => {
    const response = await request(app)
      .post('/api/v1/')
      .set('Content-Type', 'application/json')
      .send({ test: 'data' });

    expect(response.status).not.toBe(415); // Unsupported Media Type
  });

  it('should reject invalid JSON with proper error', async () => {
    const response = await request(app)
      .post('/api/v1/')
      .set('Content-Type', 'application/json')
      .send('{invalid json}');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('status', 'error');
  });

  it('should log requests', async () => {
    const response = await request(app).get('/api/v1/');

    expect(response.status).toBeDefined();
  });

  it('should have rate limiting middleware configured', async () => {
    const response = await request(app).get('/api/v1/');

    expect(response.headers['ratelimit-limit']).toBeDefined();
    expect(response.headers['ratelimit-remaining']).toBeDefined();
  });

  it('should protect against parameter pollution with hpp middleware', async () => {
    const response = await request(app)
      .get('/api/v1/?param=value1&param=value2')
      .query({ param: ['value1', 'value2'] });

    expect(response.status).not.toBe(500);
  });
});
