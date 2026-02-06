import type { IUser } from '@app/lib/db/models/users/user.model.js';
import type { TUserModifierNames } from '@models/users/user.modifiers.js';

export type TFindUserOptions = {
  /**
   * Modifier to apply.
   * - undefined: Defaults to 'safeView' (SECURE).
   * - null: Returns full model (UNSAFE - use carefully).
   * - 'shortProfile': Returns specific subset.
   * * Keys are auto-inferred from UserModel. No manual strings!
   */
  modifiers?: Nullable<TUserModifierNames | TUserModifierNames>;

  /** * Include soft-deleted users? Default: false
   */
  includeDeleted?: boolean;
};

export type TCreateUserData = Pick<IUser, 'auth0Id' | 'email' | 'isVerified'> &
  Partial<Pick<IUser, 'firstName' | 'lastName' | 'avatarUrl' | 'language' | 'currency'>>;

export type TUpdateUserProfileData = Partial<
  Pick<IUser, 'firstName' | 'lastName' | 'phone' | 'avatarUrl' | 'language' | 'currency'>
>;

export type TUpdateSystemData = Partial<
  Pick<IUser, 'auth0Id' | 'role' | 'isVerified' | 'stripeAccountId' | 'stripeOnboardingCompleted'>
>;
