import { type NextFunction, type Request, type Response } from 'express';

import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';
import { UserRepository } from '@modules/users/user.repository.js';
import { checkJwt } from '@utils/jwt.js';

export const authMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    checkJwt(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      try {
        const auth0Id = req.auth?.payload?.sub;

        if (!auth0Id) {
          throw new HttpError({
            statusCode: 401,
            message: ErrorMessages.AUTH.UNAUTHORIZED,
            internalPayload: { code: ErrorCodes.AUTH.MISSING_TOKEN_SUBJECT },
          });
        }

        const _userRepository = ioc.get(UserRepository);

        const user = await _userRepository.findByAuth0Id(auth0Id);

        if (!user) {
          throw new HttpError({
            statusCode: 401,
            message: ErrorMessages.USERS.NOT_FOUND,
            internalPayload: { code: ErrorCodes.USERS.NOT_FOUND },
          });
        }

        if (user.deletedAt) {
          throw new HttpError({
            statusCode: 403,
            message: ErrorMessages.USERS.DEACTIVATED,
            internalPayload: { code: ErrorCodes.USERS.BLOCKED },
          });
        }

        req.currentUser = user;
        next();
      } catch (error) {
        next(error);
      }
    });
  };
};
