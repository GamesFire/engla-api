import { auth } from 'express-oauth2-jwt-bearer';

import { appConfig } from '@lib/configs/app.config.js';

const TOKEN_SIGNING_ALG = 'RS256';

/**
 * Express middleware initialized with Auth0 configuration.
 *
 * This middleware validates the JWT (JSON Web Token) in the Authorization header.
 * It checks:
 * 1. The token signature (using RS256).
 * 2. The token expiration (exp).
 * 3. The issuer (iss) matches Auth0 domain.
 * 4. The audience (aud) matches the API identifier.
 *
 * If validation fails, it passes an error to the next error handler.
 * If successful, it attaches the decoded token payload to `req.auth`.
 */
export const checkJwt = auth({
  issuerBaseURL: appConfig.AUTH0_ISSUER_BASE_URL,
  audience: appConfig.AUTH0_AUDIENCE,
  tokenSigningAlg: TOKEN_SIGNING_ALG,
});
