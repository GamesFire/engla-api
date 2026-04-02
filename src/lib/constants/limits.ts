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
    },
  },
  MAX_BODY_SIZE: '10mb',
  BUSINESS: {
    MAX_PROPERTIES_PER_HOST: 20,
    MAX_PENDING_PROPERTIES: 3,
  },
} as const;
