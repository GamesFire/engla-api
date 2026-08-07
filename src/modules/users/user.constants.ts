import type { User } from '@models/users/user.model.js';

export const UserSortFields = ['createdAt', 'email', 'firstName', 'lastName', 'role'] as const;

export const UserAnonymization = {
  FIRST_NAME: 'Deleted',
  LAST_NAME: 'User',
  EMAIL_DOMAIN: '@deleted.engla.local',
} as const;

export const UserMedia = {
  AVATAR_PUBLIC_ID_PREFIX: 'avatar_user_',
} as const;

export const UserRules = {
  /**
   * Core fields that MUST be completely filled out before starting host onboarding.
   */
  REQUIRED_FOR_ONBOARDING: [
    'firstName',
    'lastName',
    'phone',
  ] as const satisfies readonly (keyof User)[],
} as const;
