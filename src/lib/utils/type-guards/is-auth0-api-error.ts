export interface Auth0ApiError {
  statusCode: number;
  message?: string;
  error?: string;
}

/**
 * Checks whether the error is an Auth0 Management API error.
 * These errors typically contain a 'statusCode' property.
 * @param {unknown} err - The error to check.
 */
export function isAuth0ApiError(err: unknown): err is Auth0ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'statusCode' in err &&
    typeof (err as Auth0ApiError).statusCode === 'number'
  );
}
