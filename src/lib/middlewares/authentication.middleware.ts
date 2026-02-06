import { type NextFunction, type Request, type Response } from 'express';

import { ErrorCode, ErrorMessage } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';
import { UserRepository } from '@modules/users/user.repository.js';
import { checkJwt } from '@utils/jwt.js';

export function authenticationMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    checkJwt(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      try {
        const auth0Id = req.auth?.payload.sub;

        if (!auth0Id) {
          throw new HttpError({
            statusCode: 401,
            message: ErrorMessage.UNAUTHORIZED,
            internalPayload: { code: ErrorCode.MISSING_TOKEN_SUBJECT },
          });
        }

        const _userRepository = ioc.get(UserRepository);

        const user = await _userRepository.findByAuth0Id(auth0Id);

        if (!user) {
          throw new HttpError({
            statusCode: 401,
            message: ErrorMessage.USER_PROFILE_NOT_FOUND,
            internalPayload: { code: ErrorCode.USER_NOT_FOUND },
          });
        }

        if (user.deletedAt) {
          throw new HttpError({
            statusCode: 403,
            message: ErrorMessage.USER_DEACTIVATED,
            internalPayload: { code: ErrorCode.USER_BLOCKED },
          });
        }

        req.currentUser = user;
        next();
      } catch (error) {
        next(error);
      }
    });
  };
}
