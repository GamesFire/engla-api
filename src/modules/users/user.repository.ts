import { type Page } from 'objection';

import type { IPaginationParams } from '@app/interfaces/pagination.interface.js';
import { provide } from '@ioc/decorators.js';
import { UserModel } from '@models/users/user.model.js';
import { UserModifier } from '@models/users/user.modifiers.js';
import { skipUndefinedFields } from '@utils/data.js';

import type {
  TCreateUserData,
  TFindUserOptions,
  TUpdateSystemData,
  TUpdateUserProfileData,
} from './user.types.js';

@provide()
export class UserRepository {
  // --- READ METHODS ---

  public async findById(
    userId: number,
    options: TFindUserOptions = {},
  ): Promise<Undefinable<UserModel>> {
    const query = UserModel.query().findById(userId);
    const modifiersToApply =
      options.modifiers === undefined ? UserModifier.SAFE_VIEW : options.modifiers;

    if (modifiersToApply) {
      query.modify(modifiersToApply);
    }

    if (!options.includeDeleted) {
      query.whereNull('deletedAt');
    }

    return query;
  }

  public async findByAuth0Id(auth0Id: string): Promise<Undefinable<UserModel>> {
    return UserModel.query().findOne({ auth0Id });
  }

  public async findByEmail(email: string): Promise<Undefinable<UserModel>> {
    return UserModel.query().findOne({ email });
  }

  public async getAllActiveUsers(params: IPaginationParams): Promise<Page<UserModel>> {
    const query = UserModel.query()
      .whereNull('deletedAt')
      .modify(UserModifier.SAFE_VIEW)
      .orderBy(params.orderBy || 'createdAt', params.order || 'desc');

    if (!params.limit) {
      const results = await query;
      return { results, total: results.length };
    }

    return query.page(params.page - 1, params.limit);
  }

  // --- WRITE METHODS ---

  public async createAndFetch(data: TCreateUserData): Promise<UserModel> {
    return UserModel.query().insertAndFetch({ ...data });
  }

  public async updateProfileAndFetch(
    userId: number,
    data: TUpdateUserProfileData,
  ): Promise<UserModel> {
    const cleanData = skipUndefinedFields(data);

    return UserModel.query().patchAndFetchById(userId, cleanData).modify(UserModifier.SAFE_VIEW);
  }

  public async updateSystemData(userId: number, data: TUpdateSystemData): Promise<UserModel> {
    return UserModel.query().patchAndFetchById(userId, data);
  }

  public async removeUser(userId: number): Promise<UserModel> {
    return UserModel.query().patchAndFetchById(userId, {
      deletedAt: new Date(),
    });
  }
}
