import type { User } from '@models/users/user.model.js';
import type { UserModifierName } from '@models/users/user.modifiers.js';
import type { GetAllUsersQueryDto } from '@routes/users/user.validation.js';

export type UserQueryOptions = {
  /**
   * Modifiers to apply to the query result.
   * Behaviors:
   * - `undefined`: Defaults to **'safeView'** (SECURE - hides sensitive fields).
   * - `null`: Returns **raw model** (UNSAFE - returns all fields).
   * - `string` or `string[]`: Applies specific modifiers (e.g., `UserModifier.SHORT_PROFILE`).
   * @remarks Keys are strongly typed via {@link UserModifierName}.
   */
  modifiers?: Nullable<UserModifierName | UserModifierName[]>;

  /**
   * Whether to include soft-deleted users (where `deletedAt` is not null).
   * @default false
   */
  includeDeleted?: boolean;
};

export type FindUserOptions = UserQueryOptions;

export type GetUsersParams = GetAllUsersQueryDto;

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
