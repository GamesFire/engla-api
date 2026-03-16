import { BaseSystemModel } from '../base-system.model.js';
import { UserModifiers } from './user.modifiers.js';

export enum UserRole {
  CLIENT = 'client',
  HOST = 'host',
  ADMIN = 'admin',
}

export enum Locale {
  EN = 'en',
}

export interface User {
  id: number;
  auth0Id: string;
  email: string;
  firstName: Nullable<string>;
  lastName: Nullable<string>;
  avatarUrl: Nullable<string>;
  phone: Nullable<string>;
  role: UserRole; // Default 'client'
  isVerified: boolean; // Default false
  language: Locale; // Default 'en'
  currency: string; // Default 'GBP'
  stripeAccountId: Nullable<string>;
  stripeOnboardingCompleted: boolean; // Default false
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Nullable<Date>;
}

export class UserModel extends BaseSystemModel implements User {
  static tableName = 'users';

  id!: number;
  auth0Id!: string;
  email!: string;
  firstName!: Nullable<string>;
  lastName!: Nullable<string>;
  avatarUrl!: Nullable<string>;
  phone!: Nullable<string>;
  role!: UserRole;
  isVerified!: boolean;
  language!: Locale;
  currency!: string;
  stripeAccountId!: Nullable<string>;
  stripeOnboardingCompleted!: boolean;

  static modifiers = UserModifiers;

  get fullName() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
}
