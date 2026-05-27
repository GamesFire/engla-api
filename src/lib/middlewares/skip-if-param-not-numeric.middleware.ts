import type { NextFunction, Request, Response } from 'express';

/**
 * Regex for matching strictly numeric strings.
 * - ^   - Start of the string.
 * - \d+ - One or more digits (0-9).
 * - $   - End of the string.
 *
 * This ensures no letters, spaces, or special characters are present.
 */
const NUMERIC_ONLY_PATTERN = /^\d+$/;

/**
 * Middleware for skips the current route (next('route'))
 * if the specified path parameter is not strictly numeric.
 * Ideal for distinguishing between routes like /:id and /me.
 *
 * @param paramName - The name of the parameter in req.params (default is 'id').
 * @returns Express middleware function.
 */
export const skipIfParamNotNumericMiddleware = (paramName: string = 'id') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const value = req.params[paramName];

    if (!value || typeof value !== 'string' || !NUMERIC_ONLY_PATTERN.test(value)) {
      return next('route');
    }

    next();
  };
};
