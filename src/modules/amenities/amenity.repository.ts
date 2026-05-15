import { type QueryBuilder } from 'objection';

import { provide } from '@ioc/decorators.js';
import { type Amenity, AmenityModel } from '@models/amenities/amenity.model.js';
import { AmenityModifier } from '@models/amenities/amenity.modifiers.js';
import { skipUndefinedFields } from '@utils/data.js';

import type {
  AmenityQueryOptions,
  CreateAmenityData,
  GetAmenitiesParams,
  UpdateAmenityParams,
} from './amenity.types.js';

@provide()
export class AmenityRepository {
  /**
   * Applies common query options for amenities.
   *
   * @param query - The query to modify.
   * @param options - The options to apply.
   */
  private _applyOptions<T>(
    query: QueryBuilder<AmenityModel, T>,
    options: AmenityQueryOptions = {},
  ): void {
    const modifiersToApply =
      options.modifiers === undefined ? AmenityModifier.WITH_CATEGORY : options.modifiers;

    if (modifiersToApply) {
      query.modify(modifiersToApply);
    }
  }

  /**
   * Applies filters to the query for searching amenities.
   *
   * @param query - The query to modify.
   * @param filters - The filters to apply.
   */
  private _applyFilters(
    query: QueryBuilder<AmenityModel, AmenityModel[]>,
    filters: GetAmenitiesParams,
  ): void {
    if (filters.scope) {
      query.where('scope', filters.scope);
    }
  }

  // --- READ METHODS ---

  public async findById(
    id: number,
    options: AmenityQueryOptions = {},
  ): Promise<Undefinable<Amenity>> {
    const query = AmenityModel.query().findById(id);

    this._applyOptions(query, options);

    return query;
  }

  public async findAll(params: GetAmenitiesParams): Promise<Amenity[]> {
    const { orderBy, orderDirection } = params;
    const query = AmenityModel.query();

    this._applyOptions(query, { modifiers: AmenityModifier.WITH_CATEGORY });
    this._applyFilters(query, params);

    query.orderBy(orderBy, orderDirection, 'first');

    if (orderBy === 'categoryId') {
      query.orderBy('name', 'asc');
    }

    return query;
  }

  public async checkNameExists(name: string, excludeId?: number): Promise<boolean> {
    const query = AmenityModel.query().where('name', 'ilike', name);
    if (excludeId) query.whereNot('id', excludeId);

    const result = await query.first();
    return !!result;
  }

  public async countByCategoryId(categoryId: number): Promise<number> {
    const result = await AmenityModel.query()
      .where('categoryId', categoryId)
      .count('id as count')
      .first();

    return Number((result as unknown as { count: string | number })?.count || 0);
  }

  // --- WRITE METHODS ---

  public async createAndFetch(
    data: CreateAmenityData,
    options: AmenityQueryOptions = {},
  ): Promise<Amenity> {
    const insertedAmenity = await AmenityModel.query().insert(data);
    return this.findById(insertedAmenity.id, options) as Promise<Amenity>;
  }

  public async updateAndFetchById(params: UpdateAmenityParams): Promise<Amenity> {
    const { amenityId, data, options = {} } = params;
    const cleanData = skipUndefinedFields(data);

    await AmenityModel.query().findById(amenityId).patch(cleanData);

    return this.findById(amenityId, options) as Promise<Amenity>;
  }

  public async deleteById(id: number): Promise<void> {
    await AmenityModel.query().deleteById(id);
  }
}
