import { type NextFunction, type Request, type Response } from 'express';

import { appConfig } from '@lib/configs/app.config.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';
import type { SystemPermission } from '@models/permission.model.js';
import { extractPermissionAction } from '@utils/extract-permission-action.js';

/**
 * Granular Permissions Middleware.
 * Validates if the authenticated user has the required action rights.
 * User must have ALL of them.
 *
 * @param requiredPermissions - Array of permissions needed for this route.
 */
export function permissionMiddleware(requiredPermissions: SystemPermission[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const user = req.currentUser;

    if (!user) {
      return next(
        new HttpError({
          statusCode: 401,
          message: ErrorMessages.AUTH.UNAUTHORIZED,
          internalPayload: { code: ErrorCodes.AUTH.UNAUTHORIZED },
        }),
      );
    }

    if (user.auth0Id === appConfig.ROOT_ADMIN_AUTH0_ID) {
      return next();
    }

    const userPermissions = (user.permissions || []).map((p) => extractPermissionAction(p));

    const hasAllRequired = requiredPermissions.every((reqPerm) =>
      userPermissions.includes(reqPerm),
    );

    if (!hasAllRequired) {
      return next(
        new HttpError({
          statusCode: 403,
          message: ErrorMessages.AUTH.FORBIDDEN,
          internalPayload: {
            code: ErrorCodes.AUTH.FORBIDDEN,
            reason: `Missing required permissions: ${requiredPermissions.join(', ')}`,
          },
        }),
      );
    }

    next();
  };
}
