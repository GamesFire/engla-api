import type { Modifiers, QueryBuilder } from 'objection';

import type { UserModel } from './user.model.js';

export const UserModifier = {
  /**
   * Safe view for the user's own profile or protected routes.
   * - HIDES: auth0Id, stripeAccountId (Strictly internal system fields).
   * - INCLUDES: Personal info like email, phone, role, etc.
   */
  SAFE_VIEW: 'safeView',

  /**
   * Minimal public profile for guests (e.g., displaying the host of a property).
   * - HIDES: Email, phone, role, exact timestamps.
   * - INCLUDES: id, firstName, avatarUrl.
   */
  SHORT_PROFILE: 'shortProfile',
} as const;

export type UserModifierName = (typeof UserModifier)[keyof typeof UserModifier];

export const UserModifiers: Modifiers<QueryBuilder<UserModel>> = {
  [UserModifier.SAFE_VIEW](builder) {
    builder.select(
      'id',
      'email',
      'firstName',
      'lastName',
      'avatarUrl',
      'phone',
      'role',
      'isVerified',
      'language',
      'currency',
      'stripeOnboardingCompleted',
      'createdAt',
      'updatedAt',
      'deletedAt',
    );
  },

  [UserModifier.SHORT_PROFILE](builder) {
    builder.select('id', 'firstName', 'avatarUrl');
  },
};
