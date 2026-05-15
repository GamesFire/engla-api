import { z } from 'zod';

export const baseSortSchema = z.object({
  orderDirection: z
    .enum(['asc', 'desc'] as const, {
      message: "Order direction must be 'asc' or 'desc'",
    })
    .default('asc'),
});
