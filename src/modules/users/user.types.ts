import type { User } from '@models/users/user.model.js';
import type { UserModifierName } from '@models/users/user.modifiers.js';
import type { AdminGetUsersQueryDto } from '@routes/users/user.validation.js';

import type { UserRules } from './user.constants.js';

export type UserQueryOptions = {
  /**
   * User modifiers to apply to the query result.
   * Behaviors:
   * - `undefined`: Defaults to **'safeView'** (SECURE - hides sensitive fields).
   * - `null`: Returns **raw model** (UNSAFE - returns all fields).
   * - `string` or `string[]`: Applies specific modifiers (e.g., `UserModifier.SHORT_PROFILE`).
   * @remarks Keys are strongly typed via {@link UserModifierName}.
   */
  modifiers?: Nullable<UserModifierName | UserModifierName[]>;

  /**
   * Whether to include soft-deleted users.
   * @default false
   */
  includeDeleted?: boolean;

  /**
   * Whether to forcefully load the user's permissions array.
   * @default false
   */
  withPermissions?: boolean;
};

export type FindUserOptions = UserQueryOptions;

export type GetUsersParams = AdminGetUsersQueryDto;

export type CreateUserData = Pick<User, 'auth0Id' | 'email' | 'isVerified'> &
  Partial<Pick<User, 'firstName' | 'lastName' | 'avatarUrl' | 'language' | 'currency'>>;

export type UpdateUserParams = {
  userId: number;
  data: Partial<User>;
  options?: UserQueryOptions;
};

export type UpdateUserProfileData = Partial<
  Pick<User, 'firstName' | 'lastName' | 'phone' | 'avatarUrl' | 'language' | 'currency'>
>;

export type UpdateUserProfileParams = {
  userId: number;
  data: UpdateUserProfileData;
  options?: UserQueryOptions;
};

export type UpdateSystemData = Partial<
  Pick<User, 'auth0Id' | 'role' | 'isVerified' | 'stripeAccountId' | 'stripeOnboardingCompleted'>
>;

export type UpdateUserSystemParams = {
  userId: number;
  data: UpdateSystemData;
  options?: UserQueryOptions;
};

/**
 * Extracts the exact string literals required specifically for host onboarding
 * (e.g., 'firstName' | 'lastName' | 'phone').
 */
export type HostOnboardingRequiredFields = (typeof UserRules.REQUIRED_FOR_ONBOARDING)[number];

/**
 * Represents a User whose profile has been validated for host onboarding.
 * All fields required by Stripe/KYC are guaranteed to be present (no nulls).
 */
export type HostOnboardingReadyUser = WithNonNullable<User, HostOnboardingRequiredFields>;

export type UploadUserAvatarParams = {
  userId: number;
  auth0Id: string;
  fileBuffer: Buffer;
};

export type InitiateHostOnboardingResult = {
  url: string;
};
