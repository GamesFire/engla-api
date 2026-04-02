import type { NextFunction, Request, Response } from 'express';

import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';
import type { UserRole } from '@models/users/user.model.js';

export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req?.currentUser;

    if (!user) {
      return next(
        new HttpError({
          statusCode: 401,
          message: ErrorMessages.AUTH.UNAUTHORIZED,
          internalPayload: { code: ErrorCodes.AUTH.UNAUTHORIZED },
        }),
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return next(
        new HttpError({
          statusCode: 403,
          message: ErrorMessages.AUTH.FORBIDDEN,
          internalPayload: {
            code: ErrorCodes.AUTH.FORBIDDEN,
            details: `Requires one of roles: ${allowedRoles.join(', ')}`,
          },
        }),
      );
    }

    next();
  };
};
