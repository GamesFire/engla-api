import { inject } from 'inversify';

import { provide } from '@ioc/decorators.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';
import type { AmenityCategory } from '@models/amenities/amenity-categories/amenity-category.model.js';
import type { Amenity } from '@models/amenities/amenity.model.js';
import type {
  CreateAmenityBodyDto,
  CreateAmenityCategoryBodyDto,
} from '@routes/amenities/amenity.validation.js';

import { AmenityCategoryRepository } from './amenity-category.repository.js';
import { AmenityRepository } from './amenity.repository.js';
import type {
  AmenityCategoryQueryOptions,
  AmenityQueryOptions,
  GetAmenitiesParams,
  GetAmenityCategoriesParams,
  UpdateAmenityCategoryParams,
  UpdateAmenityParams,
} from './amenity.types.js';

@provide()
export class AmenityService {
  constructor(
    @inject(AmenityRepository)
    private readonly _amenityRepository: AmenityRepository,
    @inject(AmenityCategoryRepository)
    private readonly _amenityCategoryRepository: AmenityCategoryRepository,
  ) {}

  private async _getExistingAmenity(
    amenityId: number,
    options?: AmenityQueryOptions,
  ): Promise<Amenity> {
    const amenity = await this._amenityRepository.findById(amenityId, options);

    if (!amenity) {
      throw new HttpError({
        statusCode: 404,
        message: ErrorMessages.AMENITIES.NOT_FOUND,
        internalPayload: { code: ErrorCodes.AMENITIES.NOT_FOUND },
      });
    }

    return amenity;
  }

  private async _getExistingAmenityCategory(
    categoryId: number,
    options?: AmenityCategoryQueryOptions,
  ): Promise<AmenityCategory> {
    const amenityCategory = await this._amenityCategoryRepository.findById(categoryId, options);

    if (!amenityCategory) {
      throw new HttpError({
        statusCode: 404,
        message: ErrorMessages.AMENITIES.CATEGORY_NOT_FOUND,
        internalPayload: { code: ErrorCodes.AMENITIES.CATEGORY_NOT_FOUND },
      });
    }

    return amenityCategory;
  }

  private async _ensureAmenityNameIsUnique(name: string, excludeId?: number): Promise<void> {
    const isDuplicateAmenity = await this._amenityRepository.checkNameExists(name, excludeId);

    if (isDuplicateAmenity) {
      throw new HttpError({
        statusCode: 409,
        message: ErrorMessages.AMENITIES.NAME_EXISTS,
        internalPayload: { code: ErrorCodes.AMENITIES.NAME_EXISTS },
      });
    }
  }

  private async _ensureAmenityCategoryNameIsUnique(
    name: string,
    excludeId?: number,
  ): Promise<void> {
    const isDuplicateAmenityCategory = await this._amenityCategoryRepository.checkNameExists(
      name,
      excludeId,
    );

    if (isDuplicateAmenityCategory) {
      throw new HttpError({
        statusCode: 409,
        message: ErrorMessages.AMENITIES.CATEGORY_NAME_EXISTS,
        internalPayload: { code: ErrorCodes.AMENITIES.CATEGORY_NAME_EXISTS },
      });
    }
  }

  public async getAmenityById(amenityId: number): Promise<Amenity> {
    return this._getExistingAmenity(amenityId);
  }

  public async getAmenities(params: GetAmenitiesParams): Promise<Amenity[]> {
    return this._amenityRepository.findAll(params);
  }

  public async createAmenity(dto: CreateAmenityBodyDto): Promise<Amenity> {
    await this._ensureAmenityNameIsUnique(dto.name);

    if (dto.categoryId) {
      await this._getExistingAmenityCategory(dto.categoryId, { modifiers: null });
    }

    return this._amenityRepository.createAndFetch(dto);
  }

  public async updateAmenity(params: UpdateAmenityParams): Promise<Amenity> {
    const { amenityId, data } = params;

    await this._getExistingAmenity(amenityId, { modifiers: null });

    if (data.name) {
      await this._ensureAmenityNameIsUnique(data.name, amenityId);
    }

    if (data.categoryId) {
      await this._getExistingAmenityCategory(data.categoryId, { modifiers: null });
    }

    return this._amenityRepository.updateAndFetchById(params);
  }

  public async deleteAmenity(amenityId: number): Promise<void> {
    await this._getExistingAmenity(amenityId, { modifiers: null });
    await this._amenityRepository.deleteById(amenityId);
  }

  public async getAmenityCategoryById(categoryId: number): Promise<AmenityCategory> {
    return this._getExistingAmenityCategory(categoryId);
  }

  public async getAmenityCategories(
    params: GetAmenityCategoriesParams,
  ): Promise<AmenityCategory[]> {
    return this._amenityCategoryRepository.findAll(params);
  }

  public async createAmenityCategory(dto: CreateAmenityCategoryBodyDto): Promise<AmenityCategory> {
    await this._ensureAmenityCategoryNameIsUnique(dto.name);

    return this._amenityCategoryRepository.createAndFetch(dto);
  }

  public async updateAmenityCategory(
    params: UpdateAmenityCategoryParams,
  ): Promise<AmenityCategory> {
    const { categoryId, data } = params;

    await this._getExistingAmenityCategory(categoryId, { modifiers: null });

    if (data.name) {
      await this._ensureAmenityCategoryNameIsUnique(data.name, categoryId);
    }

    return this._amenityCategoryRepository.updateAndFetchById(params);
  }

  public async deleteAmenityCategory(categoryId: number): Promise<void> {
    await this._getExistingAmenityCategory(categoryId, { modifiers: null });

    const linkedAmenitiesCount = await this._amenityRepository.countByCategoryId(categoryId);
    if (linkedAmenitiesCount > 0) {
      throw new HttpError({
        statusCode: 409,
        message: ErrorMessages.AMENITIES.CATEGORY_IN_USE,
        internalPayload: { code: ErrorCodes.AMENITIES.CATEGORY_IN_USE },
      });
    }

    await this._amenityCategoryRepository.deleteById(categoryId);
  }
}
