import { inject } from 'inversify';

import type { PaginatedResponse } from '@app/interfaces/pagination.interface.js';
import { provide } from '@ioc/decorators.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { RequestConfig } from '@lib/constants/limits.js';
import { HttpError } from '@lib/errors/http.error.js';
import { type Property, PropertyStatus, PropertyType } from '@models/properties/property.model.js';
import { PropertyModifier } from '@models/properties/property.modifiers.js';
import type {
  AdminGetAllPropertiesQueryDto,
  AdminUpdatePropertyBodyDto,
  CreatePropertyBodyDto,
  GetAllPropertiesQueryDto,
} from '@routes/properties/property.validation.js';

import { PropertyConstants } from './property.constants.js';
import { PropertyRepository } from './property.repository.js';
import type {
  FindPropertyOptions,
  GetExistingPropertyForHostParams,
  UpdatePropertyByHostParams,
} from './property.types.js';

@provide()
export class PropertyService {
  constructor(
    @inject(PropertyRepository) private readonly _propertyRepository: PropertyRepository,
  ) {}

  private async _getExistingProperty(
    propertyId: number,
    options?: FindPropertyOptions,
  ): Promise<Property> {
    const property = await this._propertyRepository.findById(propertyId, options);

    if (!property) {
      throw new HttpError({
        statusCode: 404,
        message: ErrorMessages.PROPERTIES.NOT_FOUND,
        internalPayload: { code: ErrorCodes.PROPERTIES.NOT_FOUND },
      });
    }

    return property;
  }

  private async _getExistingPropertyForHost(
    params: GetExistingPropertyForHostParams,
  ): Promise<Property> {
    const { propertyId, hostId, options } = params;
    const property = await this._getExistingProperty(propertyId, options);

    if (property.hostId !== hostId) {
      throw new HttpError({
        statusCode: 404,
        message: ErrorMessages.PROPERTIES.NOT_FOUND,
      });
    }

    return property;
  }

  public async getPublicPropertyById(propertyId: number): Promise<Property> {
    const property = await this._getExistingProperty(propertyId, {
      modifiers: PropertyModifier.PUBLIC_VIEW,
    });

    if (property.status !== PropertyStatus.ACTIVE) {
      throw new HttpError({ statusCode: 404, message: ErrorMessages.PROPERTIES.NOT_FOUND });
    }

    return property;
  }

  public async getPublicProperties(
    params: GetAllPropertiesQueryDto,
  ): Promise<PaginatedResponse<Property>> {
    return this._propertyRepository.getPublicProperties(params);
  }

  public async getPropertiesByHostId(
    hostId: number,
    params: GetAllPropertiesQueryDto,
  ): Promise<PaginatedResponse<Property>> {
    return this._propertyRepository.getPropertiesByHostId(hostId, params);
  }

  public async createProperty(hostId: number, dto: CreatePropertyBodyDto): Promise<Property> {
    const currentPropertiesCount = await this._propertyRepository.count({ hostId });

    if (currentPropertiesCount >= RequestConfig.BUSINESS.MAX_PROPERTIES_PER_HOST) {
      throw new HttpError({
        statusCode: 403,
        message: ErrorMessages.PROPERTIES.LIMIT_REACHED,
        internalPayload: { code: ErrorCodes.PROPERTIES.LIMIT_REACHED },
      });
    }

    return this._propertyRepository.createAndFetch(
      {
        ...dto,
        hostId,
        status: PropertyStatus.DRAFT,
      },
      { modifiers: PropertyModifier.HOST_VIEW },
    );
  }

  public async updatePropertyByHost(params: UpdatePropertyByHostParams): Promise<Property> {
    const { hostId, propertyId, data } = params;

    const property = await this._getExistingPropertyForHost({
      propertyId,
      hostId,
      options: { modifiers: PropertyModifier.HOST_VIEW },
    });

    const isUpdatingLocation = PropertyConstants.LOCATION_FIELDS.some(
      (field) => data[field] !== undefined,
    );

    if (isUpdatingLocation && property.status !== PropertyStatus.DRAFT) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.PROPERTIES.LOCATION_LOCKED,
        internalPayload: { code: ErrorCodes.PROPERTIES.LOCATION_LOCKED },
      });
    }

    return this._propertyRepository.updateAndFetchById({
      propertyId,
      data,
      options: { modifiers: PropertyModifier.HOST_VIEW },
    });
  }

  public async publishPropertyByHost(hostId: number, propertyId: number): Promise<Property> {
    const property = await this._getExistingPropertyForHost({
      propertyId,
      hostId,
      options: { modifiers: null },
    });

    if (property.status !== PropertyStatus.DRAFT) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.PROPERTIES.NOT_DRAFT,
        internalPayload: { code: ErrorCodes.PROPERTIES.NOT_DRAFT },
      });
    }

    const pendingCount = await this._propertyRepository.count({
      hostId,
      status: PropertyStatus.PENDING,
    });

    if (pendingCount >= RequestConfig.BUSINESS.MAX_PENDING_PROPERTIES) {
      throw new HttpError({
        statusCode: 403,
        message: ErrorMessages.PROPERTIES.MAX_PENDING_PROPERTIES_REACHED,
        internalPayload: { code: ErrorCodes.PROPERTIES.MAX_PENDING_PROPERTIES_REACHED },
      });
    }

    const missingFields = PropertyConstants.REQUIRED_FOR_PUBLISHING.filter(
      (field) => property[field] === null || property[field] === undefined,
    ) as string[];

    if (property.propertyType === PropertyType.HOTEL && !property.licenseNumber) {
      missingFields.push('licenseNumber');
    }

    // TODO: Check if there is at least one photo

    if (missingFields.length > 0) {
      throw new HttpError({
        statusCode: 400,
        message: `${ErrorMessages.PROPERTIES.MISSING_PUBLISH_FIELDS}: ${missingFields.join(', ')}`,
        internalPayload: {
          code: ErrorCodes.PROPERTIES.MISSING_PUBLISH_FIELDS,
          missingFields,
        },
      });
    }

    return this._propertyRepository.updateAndFetchById({
      propertyId,
      data: { status: PropertyStatus.PENDING },
      options: { modifiers: PropertyModifier.HOST_VIEW },
    });
  }

  public async pausePropertyByHost(hostId: number, propertyId: number): Promise<Property> {
    const property = await this._getExistingPropertyForHost({
      propertyId,
      hostId,
      options: { modifiers: PropertyModifier.HOST_VIEW },
    });

    if (property.status !== PropertyStatus.ACTIVE) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.PROPERTIES.NOT_ACTIVE,
        internalPayload: { code: ErrorCodes.PROPERTIES.NOT_ACTIVE },
      });
    }

    return this._propertyRepository.updateAndFetchById({
      propertyId,
      data: { status: PropertyStatus.INACTIVE },
      options: { modifiers: PropertyModifier.HOST_VIEW },
    });
  }

  public async unpausePropertyByHost(hostId: number, propertyId: number): Promise<Property> {
    const property = await this._getExistingPropertyForHost({
      propertyId,
      hostId,
      options: { modifiers: PropertyModifier.HOST_VIEW },
    });

    if (property.status !== PropertyStatus.INACTIVE) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.PROPERTIES.NOT_INACTIVE,
        internalPayload: { code: ErrorCodes.PROPERTIES.NOT_INACTIVE },
      });
    }

    return this._propertyRepository.updateAndFetchById({
      propertyId,
      data: { status: PropertyStatus.ACTIVE },
      options: { modifiers: PropertyModifier.HOST_VIEW },
    });
  }

  public async deletePropertyByHost(hostId: number, propertyId: number): Promise<void> {
    const property = await this._getExistingPropertyForHost({
      propertyId,
      hostId,
      options: { modifiers: null },
    });

    // -------------------------------------------------------------------------
    // SMART DELETE LOGIC
    // -------------------------------------------------------------------------

    // CASE A: The property is just a draft.
    // It has never been made public and has no bookings, reviews, or "favorites."
    // It can and should be permanently deleted (Hard Delete) to keep the database clean.
    if (property.status === PropertyStatus.DRAFT) {
      // TODO (Images): Before physically deleting a property from the database:
      // 1. Check if property has no any bookings
      // 2. Retrieve all images associated with this property: await _imageRepo.findByPropertyId(propertyId)
      // 3. Delete the physical files from Cloudinary using their public_id
      // 4. PostgreSQL will automatically delete rows from `property_images` thanks to CASCADE.

      await this._propertyRepository.hardDeleteById(propertyId);
      return;
    }

    // CASE B: The property was already public (ACTIVE, INACTIVE, PENDING).
    // It may be linked to financial transactions (bookings), so a hard delete is prohibited!

    // TODO (Bookings): Check if there are any ACTIVE (future or current) bookings.
    // If hasActiveBookings === true -> throw HttpError (409 Conflict).
    // The host must first cancel the booking (and pay a penalty) before archiving the listing.

    // If there are no active bookings (only past ones) -> Archive (Soft Delete).
    // All images and reviews remain in the database and on Cloudinary for the sake of history for past guests.
    await this._propertyRepository.softDeleteAndFetchById(propertyId);
  }

  public async adminGetProperties(
    params: AdminGetAllPropertiesQueryDto,
  ): Promise<PaginatedResponse<Property>> {
    return this._propertyRepository.adminGetProperties(params);
  }

  public async adminUpdateProperty(
    propertyId: number,
    dto: AdminUpdatePropertyBodyDto,
  ): Promise<Property> {
    await this._getExistingProperty(propertyId, {
      includeDeleted: true,
      modifiers: PropertyModifier.ADMIN_VIEW,
    });

    return this._propertyRepository.updateAndFetchById({
      propertyId,
      data: dto,
      options: { modifiers: PropertyModifier.ADMIN_VIEW, includeDeleted: true },
    });
  }

  public async adminDeleteProperty(propertyId: number): Promise<void> {
    await this._getExistingProperty(propertyId, { modifiers: null });

    // TODO: Handle existing bookings (e.g., auto-cancel and refund guests if admin deletes the property).

    await this._propertyRepository.softDeleteAndFetchById(propertyId);
  }
}
