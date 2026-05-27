import { type QueryBuilder } from 'objection';

import { provide } from '@ioc/decorators.js';
import {
  type AmenityCategory,
  AmenityCategoryModel,
} from '@models/amenities/amenity-categories/amenity-category.model.js';
import { skipUndefinedFields } from '@utils/data.js';

import type {
  AmenityCategoryQueryOptions,
  CreateAmenityCategoryData,
  GetAmenityCategoriesParams,
  UpdateAmenityCategoryParams,
} from './amenity.types.js';

@provide()
export class AmenityCategoryRepository {
  /**
   * Applies common query options for amenity categories.
   *
   * @param query - The query to modify.
   * @param options - The options to apply.
   */
  private _applyOptions<T>(
    query: QueryBuilder<AmenityCategoryModel, T>,
    options: AmenityCategoryQueryOptions = {},
  ): void {
    if (options.modifiers) {
      query.modify(options.modifiers);
    }
  }

  // --- READ METHODS ---

  public async findById(
    id: number,
    options: AmenityCategoryQueryOptions = {},
  ): Promise<Undefinable<AmenityCategory>> {
    const query = AmenityCategoryModel.query().findById(id);

    this._applyOptions(query, options);

    return query;
  }

  public async findAll(params: GetAmenityCategoriesParams): Promise<AmenityCategory[]> {
    const { orderBy, orderDirection } = params;

    const query = AmenityCategoryModel.query();

    query.orderBy(orderBy, orderDirection);

    if (orderBy === 'order') {
      query.orderBy('name', 'asc');
    }

    return query;
  }

  public async checkNameExists(name: string, excludeId?: number): Promise<boolean> {
    const query = AmenityCategoryModel.query().where('name', 'ilike', name);
    if (excludeId) query.whereNot('id', excludeId);

    const result = await query.first();
    return !!result;
  }

  // --- WRITE METHODS ---

  public async createAndFetch(
    data: CreateAmenityCategoryData,
    options: AmenityCategoryQueryOptions = {},
  ): Promise<AmenityCategory> {
    const insertedAmenityCategory = await AmenityCategoryModel.query().insert(data);
    return this.findById(insertedAmenityCategory.id, options) as Promise<AmenityCategory>;
  }

  public async updateAndFetchById(params: UpdateAmenityCategoryParams): Promise<AmenityCategory> {
    const { categoryId, data, options = {} } = params;
    const cleanData = skipUndefinedFields(data);

    await AmenityCategoryModel.query().findById(categoryId).patch(cleanData);

    return this.findById(categoryId, options) as Promise<AmenityCategory>;
  }

  public async deleteById(id: number): Promise<void> {
    await AmenityCategoryModel.query().deleteById(id);
  }
}
