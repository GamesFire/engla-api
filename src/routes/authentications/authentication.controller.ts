import type { Request, Response } from 'express';
import { inject } from 'inversify';

import { ErrorCode, ErrorMessage } from '@app/lib/constants/errors.js';
import { provide } from '@ioc/decorators.js';
import { appConfig } from '@lib/configs/app.config.js';
import { HttpError } from '@lib/errors/http.error.js';
import { AuthenticationService } from '@modules/authentications/authentication.service.js';
import type { TAuth0Payload } from '@modules/authentications/authentication.types.js';

import type { LoginBodyDto } from './authentication.validation.js';

@provide()
export class AuthenticationController {
  @inject(AuthenticationService) private readonly _authenticationService: AuthenticationService;

  constructor() {
    this.login = this.login.bind(this);
  }

  // ! TODO: Perform end-to-end testing of this method once the Frontend Auth0 integration is complete.
  // ! Ensure that the Access Token contains the custom 'email_verified' claim via Auth0 Actions.
  public async login(req: Request<unknown, unknown, LoginBodyDto>, res: Response) {
    const payload = req.auth?.payload as Undefinable<TAuth0Payload>;

    if (!payload?.sub) {
      throw new HttpError({
        statusCode: 401,
        message: ErrorMessage.UNAUTHORIZED,
        internalPayload: { code: ErrorCode.MISSING_TOKEN_SUBJECT },
      });
    }

    const emailVerifiedKey = `${appConfig.AUTH0_AUDIENCE}/email_verified`;
    const isEmailVerified = (payload[emailVerifiedKey] as boolean) ?? false;

    const { email, firstName, lastName, avatarUrl } = req.body;

    const user = await this._authenticationService.syncUser({
      auth0Id: payload.sub,
      dto: { email, firstName, lastName, avatarUrl },
      isEmailVerified,
    });

    res.status(200).json(user);
  }
}
