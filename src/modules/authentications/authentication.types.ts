import type { JWTPayload } from 'express-oauth2-jwt-bearer';

import type { LoginBodyDto } from '@routes/authentications/authentication.validation.js';

export type TSyncUserParams = {
  auth0Id: string;
  syncUserDto: LoginBodyDto;
  isEmailVerified: boolean;
};

export type TAuth0Payload = JWTPayload & {
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  gty: string;
  azp: string;
  [key: string]: unknown;
};
