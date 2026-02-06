import type { Modifiers, QueryBuilder } from 'objection';

import type { UserModel } from './user.model.js';

export const userModifiers = {
  safeView(builder: QueryBuilder<UserModel>) {
    builder.select(
      'id',
      'email',
      'first_name',
      'last_name',
      'avatar_url',
      'role',
      'is_verified',
      'language',
      'currency',
      'stripe_onboarding_completed',
      'created_at',
    );
  },

  shortProfile(builder: QueryBuilder<UserModel>) {
    builder.select('id', 'first_name', 'avatar_url');
  },
} satisfies Modifiers;

export const UserModifier = {
  SAFE_VIEW: 'safeView',
  SHORT_PROFILE: 'shortProfile',
} as const;

export type TUserModifierNames = keyof typeof userModifiers;
