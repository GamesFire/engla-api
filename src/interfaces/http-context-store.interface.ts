import type { Request, Response } from 'express';
import type { Logger } from 'winston';

export interface HttpContextStore {
  req: Request;
  res: Response;
  traceID: string;
  logger: Logger; // Logger attached to a specific request
}
