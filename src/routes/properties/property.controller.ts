import type { Request, Response } from 'express';
import { inject } from 'inversify';

import { provide } from '@ioc/decorators.js';
import { ErrorCodes, ErrorMessages } from '@lib/constants/errors.js';
import { HttpError } from '@lib/errors/http.error.js';
import { BookingService } from '@modules/bookings/booking.service.js';
import { PropertyService } from '@modules/properties/property.service.js';

import {
  adminGetPropertiesQuerySchema,
  adminRejectPropertyBodySchema,
  adminUpdatePropertyBodySchema,
  createPropertyBlockedDateBodySchema,
  createPropertyBodySchema,
  getPropertiesQuerySchema,
  getPropertyAvailabilityQuerySchema,
  getPropertyQuoteQuerySchema,
  propertyBlockedDateIdParamSchema,
  propertyIdParamSchema,
  propertyImageIdParamSchema,
  publishPropertyBodySchema,
  reorderPropertyImagesBodySchema,
  updatePropertyBodySchema,
} from './property.validation.js';

@provide()
export class PropertyController {
  constructor(
    @inject(PropertyService) private readonly _propertyService: PropertyService,
    @inject(BookingService) private readonly _bookingService: BookingService,
  ) {
    this.getPublicProperties = this.getPublicProperties.bind(this);
    this.getPublicPropertyById = this.getPublicPropertyById.bind(this);
    this.getPublicPropertyAvailability = this.getPublicPropertyAvailability.bind(this);
    this.getPublicPropertyQuote = this.getPublicPropertyQuote.bind(this);

    this.getMyProperties = this.getMyProperties.bind(this);
    this.createMyProperty = this.createMyProperty.bind(this);
    this.updateMyProperty = this.updateMyProperty.bind(this);
    this.publishMyProperty = this.publishMyProperty.bind(this);
    this.pauseMyProperty = this.pauseMyProperty.bind(this);
    this.unpauseMyProperty = this.unpauseMyProperty.bind(this);
    this.deleteMyProperty = this.deleteMyProperty.bind(this);
    this.uploadMyPropertyImages = this.uploadMyPropertyImages.bind(this);
    this.reorderMyPropertyImages = this.reorderMyPropertyImages.bind(this);
    this.setMainMyPropertyImage = this.setMainMyPropertyImage.bind(this);
    this.deleteMyPropertyImage = this.deleteMyPropertyImage.bind(this);
    this.getMyPropertyBlockedDates = this.getMyPropertyBlockedDates.bind(this);
    this.createMyPropertyBlockedDate = this.createMyPropertyBlockedDate.bind(this);
    this.deleteMyPropertyBlockedDate = this.deleteMyPropertyBlockedDate.bind(this);

    this.adminGetProperties = this.adminGetProperties.bind(this);
    this.adminUpdateProperty = this.adminUpdateProperty.bind(this);
    this.adminApproveProperty = this.adminApproveProperty.bind(this);
    this.adminRejectProperty = this.adminRejectProperty.bind(this);
    this.adminDeleteProperty = this.adminDeleteProperty.bind(this);
  }

  // --- PUBLIC ENDPOINTS ---

  public async getPublicProperties(req: Request, res: Response) {
    const getPropertiesQueryDto = getPropertiesQuerySchema.parse(req.query);
    const properties = await this._propertyService.getPublicProperties(getPropertiesQueryDto);

    res.status(200).json(properties);
  }

  public async getPublicPropertyById(req: Request, res: Response) {
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);
    const property = await this._propertyService.getPublicPropertyById(propertyId);

    res.status(200).json(property);
  }

  public async getPublicPropertyAvailability(req: Request, res: Response) {
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);
    const queryDto = getPropertyAvailabilityQuerySchema.parse(req.query);

    const availability = await this._bookingService.getPropertyAvailability({
      propertyId,
      query: queryDto,
    });

    res.status(200).json(availability);
  }

  public async getPublicPropertyQuote(req: Request, res: Response) {
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);
    const queryDto = getPropertyQuoteQuerySchema.parse(req.query);

    const quote = await this._bookingService.getBookingPriceQuote({
      propertyId,
      query: queryDto,
    });

    res.status(200).json(quote);
  }

  // --- HOST ENDPOINTS ---

  public async getMyProperties(req: Request, res: Response) {
    const user = req.currentUser!;
    const getPropertiesQueryDto = getPropertiesQuerySchema.parse(req.query);

    const properties = await this._propertyService.getPropertiesByHostId(
      user.id,
      getPropertiesQueryDto,
    );

    res.status(200).json(properties);
  }

  public async createMyProperty(req: Request, res: Response) {
    const user = req.currentUser!;
    const createPropertyBodyDto = createPropertyBodySchema.parse(req.body);

    const property = await this._propertyService.createProperty(user.id, createPropertyBodyDto);

    res.status(201).json(property);
  }

  public async updateMyProperty(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);
    const updatePropertyBodyDto = updatePropertyBodySchema.parse(req.body);

    const updatedProperty = await this._propertyService.updatePropertyByHost({
      hostId: user.id,
      propertyId,
      data: updatePropertyBodyDto,
    });

    res.status(200).json(updatedProperty);
  }

  public async publishMyProperty(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);
    const publishPropertyBodyDto = publishPropertyBodySchema.parse(req.body);

    const publishedProperty = await this._propertyService.publishPropertyByHost({
      hostId: user.id,
      propertyId,
      data: publishPropertyBodyDto,
    });

    res.status(200).json(publishedProperty);
  }

  public async pauseMyProperty(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);

    const pausedProperty = await this._propertyService.pausePropertyByHost(user.id, propertyId);

    res.status(200).json(pausedProperty);
  }

  public async unpauseMyProperty(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);

    const unpausedProperty = await this._propertyService.unpausePropertyByHost(user.id, propertyId);

    res.status(200).json(unpausedProperty);
  }

  public async deleteMyProperty(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);

    await this._propertyService.deletePropertyByHost(user.id, propertyId);

    res.status(204).send();
  }

  public async uploadMyPropertyImages(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      throw new HttpError({
        statusCode: 400,
        message: ErrorMessages.UPLOAD.NO_FILE_PROVIDED,
        internalPayload: { code: ErrorCodes.UPLOAD.NO_FILE_PROVIDED },
      });
    }

    const files = req.files;

    const updatedProperty = await this._propertyService.uploadPropertyImagesByHost({
      hostId: user.id,
      propertyId,
      files,
    });

    res.status(201).json(updatedProperty);
  }

  public async reorderMyPropertyImages(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);
    const reorderPropertyImagesBodyDto = reorderPropertyImagesBodySchema.parse(req.body);

    await this._propertyService.reorderPropertyImagesByHost({
      hostId: user.id,
      propertyId,
      data: reorderPropertyImagesBodyDto,
    });

    res.status(204).send();
  }

  public async setMainMyPropertyImage(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: propertyId, imageId } = propertyImageIdParamSchema.parse(req.params);

    await this._propertyService.setMainPropertyImageByHost({
      hostId: user.id,
      propertyId,
      imageId,
    });

    res.status(204).send();
  }

  public async deleteMyPropertyImage(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: propertyId, imageId } = propertyImageIdParamSchema.parse(req.params);

    await this._propertyService.deletePropertyImageByHost({
      hostId: user.id,
      propertyId,
      imageId,
    });

    res.status(204).send();
  }

  public async getMyPropertyBlockedDates(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);
    const queryDto = getPropertyAvailabilityQuerySchema.parse(req.query);

    const blockedDates = await this._propertyService.getPropertyBlockedDatesByHost({
      hostId: user.id,
      propertyId,
      query: queryDto,
    });

    res.status(200).json(blockedDates);
  }

  public async createMyPropertyBlockedDate(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);
    const bodyDto = createPropertyBlockedDateBodySchema.parse(req.body);

    const blockedDate = await this._propertyService.createPropertyBlockedDateByHost({
      hostId: user.id,
      propertyId,
      data: bodyDto,
    });

    res.status(201).json(blockedDate);
  }

  public async deleteMyPropertyBlockedDate(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: propertyId, blockId } = propertyBlockedDateIdParamSchema.parse(req.params);

    await this._propertyService.deletePropertyBlockedDateByHost({
      hostId: user.id,
      propertyId,
      blockId,
    });

    res.status(204).send();
  }

  // --- ADMIN ENDPOINTS ---

  public async adminGetProperties(req: Request, res: Response) {
    const adminGetPropertiesQueryDto = adminGetPropertiesQuerySchema.parse(req.query);
    const properties = await this._propertyService.getPropertiesByAdmin(adminGetPropertiesQueryDto);

    res.status(200).json(properties);
  }

  public async adminUpdateProperty(req: Request, res: Response) {
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);
    const adminUpdatePropertyBodyDto = adminUpdatePropertyBodySchema.parse(req.body);

    const updatedProperty = await this._propertyService.updatePropertyByAdmin(
      propertyId,
      adminUpdatePropertyBodyDto,
    );

    res.status(200).json(updatedProperty);
  }

  public async adminApproveProperty(req: Request, res: Response) {
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);
    const approvedProperty = await this._propertyService.approvePropertyByAdmin(propertyId);

    res.status(200).json(approvedProperty);
  }

  public async adminRejectProperty(req: Request, res: Response) {
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);
    const adminRejectPropertyBodyDto = adminRejectPropertyBodySchema.parse(req.body);

    const rejectedProperty = await this._propertyService.rejectPropertyByAdmin(
      propertyId,
      adminRejectPropertyBodyDto,
    );

    res.status(200).json(rejectedProperty);
  }

  public async adminDeleteProperty(req: Request, res: Response) {
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);
    await this._propertyService.deletePropertyByAdmin(propertyId);

    res.status(204).send();
  }
}
