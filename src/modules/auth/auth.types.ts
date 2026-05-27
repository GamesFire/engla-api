import type { JWTPayload } from 'express-oauth2-jwt-bearer';

import type { LoginBodyDto } from '@routes/auth/auth.validation.js';

export type SyncUserParams = {
  auth0Id: string;
  syncUserDto: LoginBodyDto;
  isEmailVerified: boolean;
};

export type Auth0Payload = JWTPayload & {
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  gty: string;
  azp: string;
  [key: string]: unknown;
};
