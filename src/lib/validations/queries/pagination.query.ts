import { z } from 'zod';

export const basePaginationSchema = z.object({
  page: z.coerce
    .number({ error: 'Page must be a number' })
    .min(1, 'Page must be greater than 0')
    .default(1),

  limit: z.coerce
    .number({ error: 'Limit must be a number' })
    .min(1, 'Limit must be greater than 0')
    .max(100, 'Limit cannot exceed 100')
    .default(10),

  orderDirection: z
    .enum(['asc', 'desc'] as const, {
      message: "Order direction must be 'asc' or 'desc'",
    })
    .default('desc'),
});
