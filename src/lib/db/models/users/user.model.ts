import { Model, type Pojo, type RelationMappings } from 'objection';

import { PermissionModel, type SystemPermission } from '@models/permission.model.js';
import { extractPermissionAction } from '@utils/extract-permission-action.js';

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
  // --- System & Identity ---
  id: number;
  auth0Id: string;
  email: string;
  role: UserRole; // Default 'client'
  isVerified: boolean; // Default false

  // --- Profile Info ---
  firstName: Nullable<string>;
  lastName: Nullable<string>;
  avatarUrl: Nullable<string>;
  phone: Nullable<string>;

  // --- Preferences & Payments ---
  language: Locale; // Default 'en'
  currency: string; // Default 'GBP'
  stripeAccountId: Nullable<string>;
  stripeOnboardingCompleted: boolean; // Default false

  // --- Timestamps ---
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Nullable<Date>;

  // --- Relations ---
  permissions?: PermissionModel[] | SystemPermission[];
}

export class UserModel extends BaseSystemModel implements User {
  static tableName = 'users';
  static modifiers = UserModifiers;

  id!: number;
  auth0Id!: string;
  email!: string;
  role!: UserRole;
  isVerified!: boolean;
  firstName!: Nullable<string>;
  lastName!: Nullable<string>;
  avatarUrl!: Nullable<string>;
  phone!: Nullable<string>;
  language!: Locale;
  currency!: string;
  stripeAccountId!: Nullable<string>;
  stripeOnboardingCompleted!: boolean;

  // --- Relations ---
  permissions?: PermissionModel[] | SystemPermission[];

  get fullName() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  // --- Relation Mappings (For Objection) ---
  static get relationMappings(): RelationMappings {
    return {
      permissions: {
        relation: Model.ManyToManyRelation,
        modelClass: PermissionModel,
        join: {
          from: 'users.id',
          through: {
            from: 'users_permissions.user_id',
            to: 'users_permissions.permission_id',
          },
          to: 'permissions.id',
        },
      },
    };
  }

  // --- Modifiers for JSON (e.g., formatting permissions array) ---
  $formatJson(json: Pojo): Pojo {
    json = super.$formatJson(json);

    if (Array.isArray(json.permissions)) {
      json.permissions = json.permissions.map((p) => extractPermissionAction(p));
    }

    return json;
  }
}
