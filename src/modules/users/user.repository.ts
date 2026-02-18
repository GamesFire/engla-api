import { type QueryBuilder } from 'objection';

import type { PaginatedResponse } from '@app/interfaces/pagination.interface.js';
import { provide } from '@ioc/decorators.js';
import { type User, UserModel } from '@models/users/user.model.js';
import { UserModifier } from '@models/users/user.modifiers.js';
import { skipUndefinedFields } from '@utils/data.js';

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
   * Applies common query options.
   * @param {QueryBuilder<UserModel, T>} query - The query to modify.
   * @param {UserQueryOptions} options - The options to apply.
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
  }

  /**
   * Applies filters to the query.
   * @param {QueryBuilder<UserModel, UserModel[]>} query - The query to modify.
   * @param {GetUsersParams} filters - The filters to apply.
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

  // --- WRITE METHODS ---

  public async createUserAndFetch(
    data: CreateUserData,
    options: FindUserOptions = {},
  ): Promise<User> {
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

  public async removeUserAndFetchById(userId: number): Promise<User> {
    const timestamp = Date.now();
    const anonymizedString = `deleted_${userId}_${timestamp}`;

    await UserModel.query()
      .findById(userId)
      .patch({
        deletedAt: new Date(),

        email: `${anonymizedString}@deleted.engla.com`,
        auth0Id: anonymizedString,

        stripeAccountId: null,
        firstName: 'Deleted',
        lastName: 'User',
        phone: null,
        avatarUrl: null,
      });

    return this.findById(userId, { includeDeleted: true }) as Promise<User>;
  }
}
