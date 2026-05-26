import { z } from 'zod';

import { baseSortSchema } from '@lib/validations/queries/sort.query.js';
import { PermissionSortFields } from '@modules/permissions/permission.constants.js';

// --- PERMISSION ADMIN SCHEMAS ---

export const getAllPermissionsQuerySchema = baseSortSchema.extend({
  orderBy: z
    .enum(PermissionSortFields, {
      message: 'Invalid orderBy field for permissions',
    })
    .default('id'),
});

// --- EXPORT TYPES ---

export type GetAllPermissionsQueryDto = z.infer<typeof getAllPermissionsQuerySchema>;
