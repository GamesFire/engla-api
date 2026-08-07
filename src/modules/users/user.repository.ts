import { type QueryBuilder } from 'objection';

import type { PaginatedResponse } from '@app/interfaces/pagination.interface.js';
import { provide } from '@ioc/decorators.js';
import { PermissionModel, type SystemPermission } from '@models/permission.model.js';
import { type User, UserModel } from '@models/users/user.model.js';
import { UserModifier } from '@models/users/user.modifiers.js';
import { skipUndefinedFields } from '@utils/data.js';
import { extractPermissionAction } from '@utils/extract-permission-action.js';

import { UserAnonymization } from './user.constants.js';
import type {
  CreateUserData,
  FindUserOptions,
  GetUsersParams,
  UpdateUserParams,
  UpdateUserProfileParams,
  UpdateUserSystemParams,
  UserQueryOptions,
} from './user.types.js';

@provide()
export class UserRepository {
  /**
   * Applies common query options for users.
   *
   * @param query - The query to modify.
   * @param options - The options to apply.
   */
  private _applyOptions<T>(
    query: QueryBuilder<UserModel, T>,
    options: UserQueryOptions = {},
  ): void {
    const modifiersToApply =
      options.modifiers === undefined ? UserModifier.SAFE_VIEW : options.modifiers;

    if (modifiersToApply) {
      query.modify(modifiersToApply);
    }

    if (!options.includeDeleted) {
      query.whereNull('deletedAt');
    }

    if (options.withPermissions) {
      query.withGraphFetched('permissions');
    }
  }

  /**
   * Applies filters to the query for searching users.
   *
   * @param query - The query to modify.
   * @param filters - The filters to apply.
   */
  private _applyFilters(
    query: QueryBuilder<UserModel, UserModel[]>,
    filters: GetUsersParams,
  ): void {
    const { search, role, isVerified, createdFrom, createdTo, includeDeleted } = filters;

    if (search) {
      query.where((builder) => {
        builder
          .where('email', 'ilike', `%${search}%`)
          .orWhere('firstName', 'ilike', `%${search}%`)
          .orWhere('lastName', 'ilike', `%${search}%`);
      });
    }

    if (role) {
      query.where('role', role);
    }

    if (isVerified !== undefined) {
      query.where('isVerified', isVerified);
    }

    if (createdFrom) {
      query.where('createdAt', '>=', createdFrom);
    }

    if (createdTo) {
      query.where('createdAt', '<=', createdTo);
    }

    if (!includeDeleted) {
      query.whereNull('deletedAt');
    }
  }

  // --- READ METHODS ---

  public async findById(userId: number, options: FindUserOptions = {}): Promise<Undefinable<User>> {
    const query = UserModel.query().findById(userId);

    this._applyOptions(query, options);

    return query;
  }

  public async findByAuth0Id(
    auth0Id: string,
    options: FindUserOptions = {},
  ): Promise<Undefinable<User>> {
    const query = UserModel.query().findOne({ auth0Id });

    this._applyOptions(query, options);

    return query;
  }

  public async findByStripeAccountId(
    stripeAccountId: string,
    options: FindUserOptions = {},
  ): Promise<Undefinable<User>> {
    const query = UserModel.query().findOne({ stripeAccountId });

    this._applyOptions(query, options);

    return query;
  }

  public async findByEmail(
    email: string,
    options: FindUserOptions = {},
  ): Promise<Undefinable<User>> {
    const query = UserModel.query().findOne({ email });

    this._applyOptions(query, options);

    return query;
  }

  public async getUsers(params: GetUsersParams): Promise<PaginatedResponse<User>> {
    const { page, limit, orderBy, orderDirection } = params;

    const query = UserModel.query().modify(UserModifier.SAFE_VIEW);

    this._applyFilters(query, params);
    query.orderBy(orderBy, orderDirection);

    const { results, total } = await query.page(page - 1, limit);
    return { results, total };
  }

  /**
   * Fetches only the granular permissions assigned to a specific user.
   * Optimized to select only the user ID and the related permission actions.
   *
   * @param userId - The ID of the user.
   * @returns An array of SystemPermissions strings.
   */
  public async getUserPermissions(userId: number): Promise<SystemPermission[]> {
    const user = await UserModel.query()
      .findById(userId)
      .select('id')
      .withGraphFetched('permissions');

    if (!user || !user.permissions) {
      return [];
    }

    return user.permissions.map((perm) => extractPermissionAction(perm));
  }

  // --- WRITE METHODS ---

  public async createAndFetch(data: CreateUserData, options: FindUserOptions = {}): Promise<User> {
    const insertedUser = await UserModel.query().insert(data);
    return this.findById(insertedUser.id, options) as Promise<User>;
  }

  public async updateAndFetchById(params: UpdateUserParams): Promise<User> {
    const { userId, data, options = {} } = params;
    const cleanData = skipUndefinedFields(data);

    await UserModel.query().findById(userId).patch(cleanData);

    return this.findById(userId, options) as Promise<User>;
  }

  public async updateProfileAndFetchById(params: UpdateUserProfileParams): Promise<User> {
    const { userId, data, options = {} } = params;
    const cleanData = skipUndefinedFields(data);

    await UserModel.query().findById(userId).patch(cleanData);

    return this.findById(userId, options) as Promise<User>;
  }

  public async updateSystemDataAndFetchById(params: UpdateUserSystemParams): Promise<User> {
    const { userId, data, options = {} } = params;
    const cleanData = skipUndefinedFields(data);

    await UserModel.query().findById(userId).patch(cleanData);

    return this.findById(userId, options) as Promise<User>;
  }

  public async softDeleteAndFetchById(userId: number): Promise<User> {
    const timestamp = Date.now();
    const anonymizedString = `deleted_${userId}_${timestamp}`;

    await UserModel.query()
      .findById(userId)
      .patch({
        deletedAt: new Date(),

        email: `${anonymizedString}${UserAnonymization.EMAIL_DOMAIN}`,
        auth0Id: anonymizedString,

        stripeAccountId: null,
        firstName: UserAnonymization.FIRST_NAME,
        lastName: UserAnonymization.LAST_NAME,
        phone: null,
        avatarUrl: null,
      });

    return this.findById(userId, {
      includeDeleted: true,
      modifiers: null,
    }) as Promise<User>;
  }

  /**
   * Syncs user permissions by completely replacing the old ones with the new set.
   * Uses an auto-managed transaction to ensure data integrity.
   *
   * @param userId - The ID of the user.
   * @param actions - An array of SystemPermission strings.
   * @returns An array of SystemPermissions strings.
   */
  public async syncUserPermissions(
    userId: number,
    actions: SystemPermission[],
  ): Promise<SystemPermission[]> {
    return UserModel.transaction(async (trx) => {
      await UserModel.relatedQuery('permissions', trx).for(userId).unrelate();

      if (actions.length > 0) {
        const permissionsToAssign = await PermissionModel.query(trx).whereIn('action', actions);
        const permissionIds = permissionsToAssign.map((p) => p.id);

        if (permissionIds.length > 0) {
          await UserModel.relatedQuery('permissions', trx).for(userId).relate(permissionIds);
        }
      }

      return actions;
    });
  }
}
