export const ErrorCodes = {
  SYSTEM: {
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    JSON_PARSE_ERROR: 'JSON_PARSE_ERROR',
    ROUTE_NOT_FOUND: 'HTTP_404',
  },
  INTEGRATION: {
    IDENTITY_PROVIDER: 'IDENTITY_PROVIDER_ERROR',
    CLOUD_STORAGE: 'CLOUD_STORAGE_ERROR',
  },
  HTTP: {
    BAD_REQUEST: 'HTTP_400',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
  },
  UPLOAD: {
    GENERIC_ERROR: 'UPLOAD_ERROR',
    NO_FILE_PROVIDED: 'NO_FILE_PROVIDED',
    FILE_TOO_LARGE: 'FILE_TOO_LARGE',
    TOO_MANY_FILES: 'TOO_MANY_FILES',
    UNEXPECTED_FILE: 'UNEXPECTED_FILE',
    INVALID_FORMAT: 'INVALID_FILE_FORMAT',
  },
  RATE_LIMIT: {
    GLOBAL: 'TOO_MANY_GLOBAL_REQUESTS',
    STRICT: 'TOO_MANY_STRICT_REQUESTS',
  },
  AUTH: {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    MISSING_TOKEN_SUBJECT: 'MISSING_TOKEN_SUBJECT',
  },
  USERS: {
    NOT_FOUND: 'USER_NOT_FOUND',
    BLOCKED: 'USER_BLOCKED',
  },
  PROPERTIES: {
    NOT_FOUND: 'PROPERTY_NOT_FOUND',
    LIMIT_REACHED: 'PROPERTY_LIMIT_REACHED',
    LOCATION_LOCKED: 'PROPERTY_LOCATION_LOCKED',
    HAS_ACTIVE_BOOKINGS: 'PROPERTY_HAS_ACTIVE_BOOKINGS',
    NOT_DRAFT: 'PROPERTY_NOT_DRAFT',
    MISSING_PUBLISH_FIELDS: 'PROPERTY_MISSING_PUBLISH_FIELDS',
    MAX_PENDING_PROPERTIES_REACHED: 'MAX_PENDING_PROPERTIES_REACHED',
    NOT_ACTIVE: 'PROPERTY_NOT_ACTIVE',
    NOT_INACTIVE: 'PROPERTY_NOT_INACTIVE',
  },
} as const;

export const ErrorMessages = {
  SYSTEM: {
    INTERNAL_SERVER_ERROR: 'Internal Server Error',
    JSON_INVALID: 'Invalid JSON format',
    GENERIC_PROD_ERROR: 'Something went wrong. Please try again later',
    ROUTE_NOT_FOUND: 'Route not found',
  },
  INTEGRATION: {
    IDENTITY_PROVIDER: 'Failed to synchronize with Identity Provider. Please try again later.',
    CLOUD_STORAGE: 'Failed to communicate with cloud storage service. Please try again later.',
  },
  UPLOAD: {
    GENERIC_ERROR: 'Upload error',
    NO_FILE_PROVIDED: 'No file provided',
    FILE_TOO_LARGE: 'File is too large',
    TOO_MANY_FILES: 'Too many files',
    UNEXPECTED_FILE: 'Unexpected file field',
    INVALID_FORMAT: 'Unsupported file format. Only JPEG, PNG, and WebP are allowed',
  },
  VALIDATION: {
    FAILED: 'Validation failed',
  },
  RATE_LIMIT: {
    GLOBAL: 'Too many requests, please try again later',
    AUTH_LOGIN: 'Too many login attempts. Please try again later',
    USER_UPDATE: 'Too many account update attempts. Please try again later',
    USER_DELETION: 'Too many account deletion attempts. Please try again later',
    PROPERTY_SEARCH: 'Too many search requests. Please slow down',
    PROPERTY_CREATION: 'Too many property creation attempts. Please try again later',
    PROPERTY_UPDATE: 'Too many property update attempts. Please try again later',
    USER_AVATAR_UPLOAD: 'Too many avatar upload attempts. Please try again later',
    PROPERTY_PUBLISH: 'Too many publish attempts. Please wait before trying again',
    PROPERTY_STATUS_CHANGE: 'Too many status change attempts. Please wait before trying again',
  },
  AUTH: {
    UNAUTHORIZED: 'Authentication failed',
    FORBIDDEN: 'You do not have permission to perform this action',
    LINKING_REQUIRES_VERIFIED_EMAIL:
      'Please verify your email address before logging in to link your account',
  },
  USERS: {
    NOT_FOUND: 'User profile not found. Please complete registration',
    DEACTIVATED: 'User account is deactivated. Please contact support',
  },
  PROPERTIES: {
    NOT_FOUND: 'Property not found',
    LIMIT_REACHED: 'You have reached the maximum allowed number of properties',
    LOCATION_LOCKED:
      'You cannot change the location of a property that is no longer a draft. Please create a new listing instead',
    HAS_ACTIVE_BOOKINGS:
      'Cannot archive or delete this property because it has active or future bookings',
    NOT_DRAFT: 'Only draft properties can be published',
    MISSING_PUBLISH_FIELDS: 'Cannot publish property. Missing required fields',
    MAX_PENDING_PROPERTIES_REACHED:
      'You have reached the maximum number of properties awaiting review',
    NOT_ACTIVE: 'Only active properties can be paused',
    NOT_INACTIVE: 'Only inactive properties can be unpaused',
  },
} as const;
