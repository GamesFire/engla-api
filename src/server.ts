import cors from 'cors';
import express, { type Express } from 'express';
import type { Container } from 'inversify';

export async function createServer(_ioc: Container): Promise<Express> {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}
