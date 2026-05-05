import { inject } from 'inversify';

import type { PaginatedResponse } from '@app/interfaces/pagination.interface.js';
import { provide } from '@ioc/decorators.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { RequestConfig } from '@lib/constants/limits.js';
import { HttpError } from '@lib/errors/http.error.js';
import { CloudinaryConfig } from '@lib/integrations/cloudinary/cloudinary.constants.js';
import { CloudinaryService } from '@lib/integrations/cloudinary/cloudinary.service.js';
import { type Property, PropertyStatus, PropertyType } from '@models/properties/property.model.js';
import { PropertyModifier } from '@models/properties/property.modifiers.js';
import type { PropertyImage } from '@models/property-image.model.js';
import type {
  AdminGetAllPropertiesQueryDto,
  AdminUpdatePropertyBodyDto,
  CreatePropertyBodyDto,
  GetAllPropertiesQueryDto,
} from '@routes/properties/property.validation.js';

import { PropertyImageRepository } from './property-image.repository.js';
import { PropertyRules } from './property.constants.js';
import { PropertyRepository } from './property.repository.js';
import type {
  FindPropertyOptions,
  GetExistingPropertyForHostParams,
  PropertyImageParams,
  ReorderPropertyImagesParams,
  UpdatePropertyByHostParams,
  UploadPropertyImagesParams,
} from './property.types.js';

@provide()
export class PropertyService {
  constructor(
    @inject(PropertyRepository) private readonly _propertyRepository: PropertyRepository,
    @inject(PropertyImageRepository)
    private readonly _propertyImageRepository: PropertyImageRepository,
    @inject(CloudinaryService) private readonly _cloudinaryService: CloudinaryService,
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

  private async _getExistingPropertyImage(
    imageId: number,
    propertyId: number,
  ): Promise<PropertyImage> {
    const image = await this._propertyImageRepository.findByIdAndPropertyId(imageId, propertyId);

    if (!image) {
      throw new HttpError({
        statusCode: 404,
        message: ErrorMessages.PROPERTIES.IMAGE_NOT_FOUND,
        internalPayload: { code: ErrorCodes.PROPERTIES.IMAGE_NOT_FOUND },
      });
    }

    return image;
  }

  /**
   * Helper method for safely deleting a property.
   *
   * @param property - The property to be deleted.
   * @returns A promise that resolves when the deletion is complete.
   */
  private async _executeSmartPropertyDeletion(property: Property): Promise<void> {
    if (property.status === PropertyStatus.DRAFT) {
      const images = await this._propertyImageRepository.findAllByPropertyId(property.id);

      const deletePromises = images
        .filter((img) => img.publicId)
        .map((img) => this._cloudinaryService.deleteImage(img.publicId!).catch(() => {}));

      await Promise.all(deletePromises);

      await this._propertyRepository.hardDeleteById(property.id);
      return;
    }

    // CASE B: The property was already public (ACTIVE, INACTIVE, PENDING).
    // It may be linked to financial transactions (bookings), so a hard delete is prohibited!

    // TODO (Bookings): Check if there are any ACTIVE (future or current) bookings.
    // If hasActiveBookings === true -> throw HttpError (409 Conflict).
    // The user/admin must first cancel the booking before archiving the listing.

    // If there are no active bookings (only past ones) -> Archive (Soft Delete).
    // All images and reviews remain in the database and on Cloudinary for the sake of history.
    await this._propertyRepository.softDeleteAndFetchById(property.id);
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

    const isUpdatingLocation = PropertyRules.LOCATION_FIELDS.some(
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

    const missingFields = PropertyRules.REQUIRED_FOR_PUBLISHING.filter(
      (field) => property[field] === null || property[field] === undefined,
    ) as string[];

    if (property.propertyType === PropertyType.HOTEL && !property.licenseNumber) {
      missingFields.push(PropertyRules.DYNAMIC_PUBLISH_FIELDS.LICENSE);
    }

    const imagesCount = await this._propertyImageRepository.countByPropertyId(propertyId);
    if (imagesCount === 0) {
      missingFields.push(PropertyRules.DYNAMIC_PUBLISH_FIELDS.IMAGES);
    }

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

    await this._executeSmartPropertyDeletion(property);
  }

  public async uploadImages(params: UploadPropertyImagesParams): Promise<Property> {
    const { files, hostId, propertyId } = params;

    await this._getExistingPropertyForHost({ propertyId, hostId, options: { modifiers: null } });

    const currentImagesCount = await this._propertyImageRepository.countByPropertyId(propertyId);
    if (currentImagesCount + files.length > RequestConfig.UPLOAD.MAX_PROPERTY_IMAGES) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.UPLOAD.TOO_MANY_FILES,
        internalPayload: { code: ErrorCodes.UPLOAD.TOO_MANY_FILES },
      });
    }

    const uploadPromises = files.map((file) =>
      this._cloudinaryService.uploadImage({
        fileBuffer: file.buffer,
        targetFolder: CloudinaryConfig.FOLDERS.PROPERTIES,
      }),
    );
    const uploadResults = await Promise.all(uploadPromises);

    const isFirstUpload = currentImagesCount === 0;
    const imagesToInsert = uploadResults.map((result, index) => ({
      propertyId,
      url: result.url,
      publicId: result.publicId,
      isMain: isFirstUpload && index === 0,
      order: currentImagesCount + index,
    }));

    await this._propertyImageRepository.insertMany(imagesToInsert);

    return this._getExistingProperty(propertyId, { modifiers: PropertyModifier.HOST_VIEW });
  }

  public async reorderPropertyImages(params: ReorderPropertyImagesParams): Promise<void> {
    const { imageIds, hostId, propertyId } = params;

    await this._getExistingPropertyForHost({ propertyId, hostId, options: { modifiers: null } });

    const existingImages = await this._propertyImageRepository.findAllByPropertyId(propertyId);

    if (existingImages.length !== imageIds.length) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.PROPERTIES.INVALID_IMAGE_REORDER_COUNT,
        internalPayload: { code: ErrorCodes.PROPERTIES.INVALID_IMAGE_REORDER_COUNT },
      });
    }

    const existingIds = existingImages.map((img) => img.id);
    const hasInvalidIds = imageIds.some((id) => !existingIds.includes(id));

    if (hasInvalidIds) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.PROPERTIES.INVALID_IMAGE_REORDER_IDS,
        internalPayload: { code: ErrorCodes.PROPERTIES.INVALID_IMAGE_REORDER_IDS },
      });
    }

    await this._propertyImageRepository.reorderImages(imageIds, propertyId);

    const firstImageId = imageIds[0];
    if (firstImageId !== undefined) {
      await this._propertyImageRepository.setMainImage(firstImageId, propertyId);
    }
  }

  public async deleteImage(params: PropertyImageParams): Promise<void> {
    const { imageId, hostId, propertyId } = params;

    await this._getExistingPropertyForHost({ propertyId, hostId, options: { modifiers: null } });

    const image = await this._getExistingPropertyImage(imageId, propertyId);

    if (image.publicId) {
      this._cloudinaryService.deleteImage(image.publicId).catch(() => {});
    }

    await this._propertyImageRepository.deleteById(imageId);

    const remainingImages = await this._propertyImageRepository.findAllByPropertyId(propertyId);

    if (remainingImages.length > 0) {
      const remainingIds = remainingImages.map((img) => img.id);
      await this._propertyImageRepository.reorderImages(remainingIds, propertyId);

      const firstImageId = remainingIds[0];
      if (image.isMain && firstImageId !== undefined) {
        await this._propertyImageRepository.setMainImage(firstImageId, propertyId);
      }
    }
  }

  public async setMainImage(params: PropertyImageParams): Promise<void> {
    const { imageId, hostId, propertyId } = params;

    await this._getExistingPropertyForHost({ propertyId, hostId, options: { modifiers: null } });
    await this._getExistingPropertyImage(imageId, propertyId);

    await this._propertyImageRepository.setMainImage(imageId, propertyId);

    const allImages = await this._propertyImageRepository.findAllByPropertyId(propertyId);

    const reorderedIds = [
      imageId,
      ...allImages.map((img) => img.id).filter((id) => id !== imageId),
    ];

    await this._propertyImageRepository.reorderImages(reorderedIds, propertyId);
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
    const property = await this._getExistingProperty(propertyId, { modifiers: null });

    // TODO: Handle existing bookings (e.g., auto-cancel and refund guests if admin deletes the property).

    await this._executeSmartPropertyDeletion(property);
  }
}
