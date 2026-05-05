import { type QueryBuilder } from 'objection';

import type { PaginatedResponse } from '@app/interfaces/pagination.interface.js';
import { provide } from '@ioc/decorators.js';
import { type Property, PropertyModel, PropertyStatus } from '@models/properties/property.model.js';
import { PropertyModifier } from '@models/properties/property.modifiers.js';
import { skipUndefinedFields } from '@utils/data.js';

import type {
  AdminGetPropertiesParams,
  CreatePropertyData,
  FindPropertyOptions,
  GetPublicPropertiesParams,
  PropertyQueryOptions,
  UpdatePropertyParams,
} from './property.types.js';

@provide()
export class PropertyRepository {
  /**
   * Applies common query options.
   *
   * @param query - The query to modify.
   * @param options - The options to apply.
   */
  private _applyOptions<T>(
    query: QueryBuilder<PropertyModel, T>,
    options: PropertyQueryOptions = {},
  ): void {
    const modifiersToApply =
      options.modifiers === undefined ? PropertyModifier.PUBLIC_VIEW : options.modifiers;

    if (modifiersToApply) {
      query.modify(modifiersToApply);
    }

    if (!options.includeDeleted) {
      query.whereNull('deletedAt');
    }
  }

  /**
   * Applies complex filters for searching properties.
   *
   * @param query - The query to modify.
   * @param filters - The filters to apply.
   */
  private _applyFilters(
    query: QueryBuilder<PropertyModel, PropertyModel[]>,
    filters: GetPublicPropertiesParams | AdminGetPropertiesParams,
  ): void {
    const {
      city,
      county,
      propertyType,
      roomType,
      cancellationPolicy,
      minPrice,
      maxPrice,
      minGuests,
      minBedrooms,
      minBeds,
      minBathrooms,
      isPetsAllowed,
    } = filters;

    if (city) query.where('city', 'ilike', `%${city}%`);
    if (county) query.where('county', county);

    if (propertyType) query.where('propertyType', propertyType);
    if (roomType) query.where('roomType', roomType);
    if (cancellationPolicy) query.where('cancellationPolicy', cancellationPolicy);

    if (minPrice !== undefined) query.where('pricePerNight', '>=', minPrice);
    if (maxPrice !== undefined) query.where('pricePerNight', '<=', maxPrice);

    if (minGuests !== undefined) query.where('maxGuests', '>=', minGuests);
    if (minBedrooms !== undefined) query.where('bedrooms', '>=', minBedrooms);
    if (minBeds !== undefined) query.where('beds', '>=', minBeds);
    if (minBathrooms !== undefined) query.where('bathrooms', '>=', minBathrooms);

    if (isPetsAllowed !== undefined) query.where('isPetsAllowed', isPetsAllowed);

    if ('status' in filters && filters.status) {
      query.where('status', filters.status);
    }

    if ('hostId' in filters && filters.hostId) {
      query.where('hostId', filters.hostId);
    }

    if ('licenseNumber' in filters && filters.licenseNumber) {
      query.where('licenseNumber', filters.licenseNumber);
    }

    if ('includeDeleted' in filters && !filters.includeDeleted) {
      query.whereNull('deletedAt');
    }
  }

  // --- READ METHODS ---

  public async findById(
    propertyId: number,
    options: FindPropertyOptions = {},
  ): Promise<Undefinable<Property>> {
    const query = PropertyModel.query().findById(propertyId);

    this._applyOptions(query, options);

    return query;
  }

  /**
   * A universal method for counting properties based on any criteria.
   *
   * @param filters - An object with fields for filtering.
   * @returns A promise that resolves to the count of properties that match the filters.
   *
   * @example
   * count({ hostId: 1, status: PropertyStatus.PENDING })
   */
  public async count(filters: Partial<Property>): Promise<number> {
    const cleanFilters = skipUndefinedFields(filters);

    const result = await PropertyModel.query()
      .where(cleanFilters)
      .whereNull('deletedAt')
      .count('id as count')
      .first();

    return Number((result as unknown as { count: string | number })?.count || 0);
  }

  public async getPublicProperties(
    params: GetPublicPropertiesParams,
  ): Promise<PaginatedResponse<Property>> {
    const { page, limit, orderBy, orderDirection } = params;

    const query = PropertyModel.query().modify(PropertyModifier.PUBLIC_VIEW);

    query.where('status', PropertyStatus.ACTIVE);
    query.whereNull('deletedAt');

    this._applyFilters(query, params);
    query.orderBy(orderBy, orderDirection);

    const { results, total } = await query.page(page - 1, limit);
    return { results, total };
  }

  public async getPropertiesByHostId(
    hostId: number,
    params: GetPublicPropertiesParams,
  ): Promise<PaginatedResponse<Property>> {
    const { page, limit, orderBy, orderDirection } = params;

    const query = PropertyModel.query().modify(PropertyModifier.HOST_VIEW);

    query.where({ hostId });
    query.whereNull('deletedAt');

    this._applyFilters(query, params);
    query.orderBy(orderBy, orderDirection);

    const { results, total } = await query.page(page - 1, limit);
    return { results, total };
  }

  public async adminGetProperties(
    params: AdminGetPropertiesParams,
  ): Promise<PaginatedResponse<Property>> {
    const { page, limit, orderBy, orderDirection } = params;

    const query = PropertyModel.query().modify(PropertyModifier.ADMIN_VIEW);

    this._applyFilters(query, params);
    query.orderBy(orderBy, orderDirection);

    const { results, total } = await query.page(page - 1, limit);
    return { results, total };
  }

  // --- WRITE METHODS ---

  public async createAndFetch(
    data: CreatePropertyData,
    options: FindPropertyOptions = {},
  ): Promise<Property> {
    const insertedProperty = await PropertyModel.query().insert(data);
    return this.findById(insertedProperty.id, options) as Promise<Property>;
  }

  public async updateAndFetchById(params: UpdatePropertyParams): Promise<Property> {
    const { propertyId, data, options = {} } = params;
    const cleanData = skipUndefinedFields(data);

    await PropertyModel.query().findById(propertyId).patch(cleanData);
    return this.findById(propertyId, options) as Promise<Property>;
  }

  public async softDeleteAndFetchById(propertyId: number): Promise<Property> {
    await PropertyModel.query().findById(propertyId).patch({
      deletedAt: new Date(),
      status: PropertyStatus.ARCHIVED,
    });

    return this.findById(propertyId, {
      includeDeleted: true,
      modifiers: null,
    }) as Promise<Property>;
  }

  public async hardDeleteById(propertyId: number): Promise<void> {
    await PropertyModel.query().deleteById(propertyId);
  }
}
