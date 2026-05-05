import { FileSizeBytes } from './file-size.js';
import { TimeMs } from './time.js';

export const RequestConfig = {
  RATE_LIMIT: {
    GLOBAL: {
      WINDOW_MS: TimeMs.FIFTEEN_MINUTES,
      MAX_REQUESTS: 100,
    },
    AUTH: {
      LOGIN: {
        WINDOW_MS: TimeMs.FIFTEEN_MINUTES,
        MAX_REQUESTS: 10,
      },
    },
    USERS: {
      UPDATE: {
        WINDOW_MS: TimeMs.ONE_HOUR,
        MAX_REQUESTS: 15,
      },
      UPLOAD_AVATAR: {
        WINDOW_MS: TimeMs.ONE_HOUR,
        MAX_REQUESTS: 5,
      },
      DELETION: {
        WINDOW_MS: TimeMs.ONE_HOUR,
        MAX_REQUESTS: 3,
      },
    },
    PROPERTIES: {
      SEARCH: {
        WINDOW_MS: TimeMs.ONE_MINUTE,
        MAX_REQUESTS: 30,
      },
      CREATION: {
        WINDOW_MS: TimeMs.ONE_HOUR,
        MAX_REQUESTS: 5,
      },
      UPDATE: {
        WINDOW_MS: TimeMs.ONE_MINUTE,
        MAX_REQUESTS: 60,
      },
      PUBLISH: {
        WINDOW_MS: TimeMs.ONE_HOUR,
        MAX_REQUESTS: 10,
      },
      STATUS_CHANGE: {
        WINDOW_MS: TimeMs.ONE_HOUR,
        MAX_REQUESTS: 10,
      },
      UPLOAD_IMAGES: {
        WINDOW_MS: TimeMs.ONE_HOUR,
        MAX_REQUESTS: 10,
      },
      MANAGE_IMAGES: {
        WINDOW_MS: TimeMs.ONE_MINUTE,
        MAX_REQUESTS: 60,
      },
    },
  },
  MAX_JSON_BODY_SIZE: 10 * FileSizeBytes.MB,
  UPLOAD: {
    MAX_IMAGE_SIZE_BYTES: 5 * FileSizeBytes.MB,
    MAX_PROPERTY_IMAGES: 20,
    ALLOWED_IMAGE_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
    FIELDS: {
      AVATAR: 'avatar',
      PROPERTY_IMAGES: 'images',
    },
  },
  BUSINESS: {
    MAX_PROPERTIES_PER_HOST: 20,
    MAX_PENDING_PROPERTIES: 3,
  },
} as const;
