import { z } from 'zod';

import { ValidationLimits } from '@lib/constants/validation.js';

import { baseSortSchema } from './sort.query.js';

export const basePaginationSchema = baseSortSchema.extend({
  page: z.coerce
    .number({ error: 'Page must be a number' })
    .min(
      ValidationLimits.PAGINATION.MIN_PAGE,
      `Page must be at least ${ValidationLimits.PAGINATION.MIN_PAGE}`,
    )
    .default(ValidationLimits.PAGINATION.DEFAULT_PAGE),

  limit: z.coerce
    .number({ error: 'Limit must be a number' })
    .min(
      ValidationLimits.PAGINATION.MIN_LIMIT,
      `Limit must be at least ${ValidationLimits.PAGINATION.MIN_LIMIT}`,
    )
    .max(
      ValidationLimits.PAGINATION.MAX_LIMIT,
      `Limit cannot exceed ${ValidationLimits.PAGINATION.MAX_LIMIT}`,
    )
    .default(ValidationLimits.PAGINATION.DEFAULT_LIMIT),

  orderDirection: z
    .enum(['asc', 'desc'] as const, {
      message: "Order direction must be 'asc' or 'desc'",
    })
    .default(ValidationLimits.PAGINATION.DEFAULT_ORDER_DIRECTION),
});
