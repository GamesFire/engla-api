import type { Request, Response } from 'express';
import { inject } from 'inversify';

import { AuthService } from '@app/modules/auth/auth.service.js';
import type { Auth0Payload } from '@app/modules/auth/auth.types.js';
import { provide } from '@ioc/decorators.js';
import { appConfig } from '@lib/configs/app.config.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';

import { loginBodySchema } from './auth.validation.js';

@provide()
export class AuthController {
  constructor(@inject(AuthService) private readonly _authService: AuthService) {
    this.login = this.login.bind(this);
  }

  // ! TODO: Perform end-to-end testing of this method once the Frontend Auth0 integration is complete.
  // ! Ensure that the Access Token contains the custom 'email_verified' claim via Auth0 Actions.
  public async login(req: Request, res: Response) {
    const payload = req.auth?.payload as Undefinable<Auth0Payload>;
    const loginBodyDto = loginBodySchema.parse(req.body);

    if (!payload?.sub) {
      throw new HttpError({
        statusCode: 401,
        message: ErrorMessages.UNAUTHORIZED,
        internalPayload: { code: ErrorCodes.MISSING_TOKEN_SUBJECT },
      });
    }

    const emailVerifiedKey = `${appConfig.AUTH0_AUDIENCE}/email_verified`;
    const isEmailVerified = (payload[emailVerifiedKey] as boolean) ?? false;

    const { email, firstName, lastName, avatarUrl } = loginBodyDto;

    const user = await this._authService.syncUser({
      auth0Id: payload.sub,
      syncUserDto: { email, firstName, lastName, avatarUrl },
      isEmailVerified,
    });

    res.status(200).json(user);
  }
}
