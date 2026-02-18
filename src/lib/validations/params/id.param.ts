import { z } from 'zod';

export const idSchema = z.coerce
  .number({ message: 'ID must be a valid number' })
  .int({ message: 'ID must be an integer' })
  .positive({ message: 'ID must be greater than 0' });

export const idParamSchema = z
  .object({
    id: idSchema,
  })
  .strict();
