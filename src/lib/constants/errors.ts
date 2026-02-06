export const ErrorCode = {
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  JSON_PARSE_ERROR: 'JSON_PARSE_ERROR',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_BLOCKED: 'USER_BLOCKED',
  MISSING_TOKEN_SUBJECT: 'MISSING_TOKEN_SUBJECT',
  HTTP_BAD_REQUEST: 'HTTP_400',
  HTTP_UNAUTHORIZED: 'HTTP_401',
  HTTP_FORBIDDEN: 'HTTP_403',
  HTTP_NOT_FOUND: 'HTTP_404',
} as const;

export const ErrorMessage = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  VALIDATION_FAILED: 'Validation failed',
  JSON_INVALID: 'Invalid JSON format',
  FILE_TOO_LARGE: 'File is too large',
  TOO_MANY_FILES: 'Too many files',
  UNEXPECTED_FILE: 'Unexpected file field',
  GENERIC_UPLOAD_ERROR: 'Upload error',
  GENERIC_PROD_ERROR: 'Something went wrong. Please try again later',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  UNAUTHORIZED: 'Authentication failed',
  USER_PROFILE_NOT_FOUND: 'User profile not found. Please complete registration',
  USER_DEACTIVATED: 'User account is deactivated. Please contact support',
  ACCOUNT_LINKING_REQUIRES_VERIFIED_EMAIL:
    'Please verify your email address before logging in to link your account',
  ROUTE_NOT_FOUND: 'Route not found',
} as const;
