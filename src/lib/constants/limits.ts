import { TimeMs } from './time.js';

export const RequestConfig = {
  RATE_LIMIT: {
    GLOBAL: {
      WINDOW_MS: TimeMs.FIFTEEN_MINUTES,
      MAX_REQUESTS: 100,
    },
    STRICT: {
      WINDOW_MS: TimeMs.ONE_HOUR,
      MAX_REQUESTS: 3,
    },
  },
  MAX_BODY_SIZE: '10mb',
} as const;
