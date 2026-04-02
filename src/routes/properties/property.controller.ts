import type { Request, Response } from 'express';
import { inject } from 'inversify';

import { provide } from '@ioc/decorators.js';
import { PropertyService } from '@modules/properties/property.service.js';

import {
  adminGetAllPropertiesQuerySchema,
  adminUpdatePropertyBodySchema,
  createPropertyBodySchema,
  getAllPropertiesQuerySchema,
  propertyIdParamSchema,
  updatePropertyBodySchema,
} from './property.validation.js';

@provide()
export class PropertyController {
  constructor(@inject(PropertyService) private readonly _propertyService: PropertyService) {
    this.getPublicPropertyById = this.getPublicPropertyById.bind(this);
    this.getAllPublicProperties = this.getAllPublicProperties.bind(this);

    this.getMyProperties = this.getMyProperties.bind(this);
    this.createMyProperty = this.createMyProperty.bind(this);
    this.updateMyProperty = this.updateMyProperty.bind(this);
    this.publishMyProperty = this.publishMyProperty.bind(this);
    this.pauseMyProperty = this.pauseMyProperty.bind(this);
    this.unpauseMyProperty = this.unpauseMyProperty.bind(this);
    this.deleteMyProperty = this.deleteMyProperty.bind(this);

    this.adminGetAllProperties = this.adminGetAllProperties.bind(this);
    this.adminUpdateProperty = this.adminUpdateProperty.bind(this);
    this.adminDeleteProperty = this.adminDeleteProperty.bind(this);
  }

  // --- PUBLIC ENDPOINTS ---

  public async getPublicPropertyById(req: Request, res: Response) {
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);
    const property = await this._propertyService.getPublicPropertyById(propertyId);

    res.status(200).json(property);
  }

  public async getAllPublicProperties(req: Request, res: Response) {
    const queryDto = getAllPropertiesQuerySchema.parse(req.query);
    const properties = await this._propertyService.getPublicProperties(queryDto);

    res.status(200).json(properties);
  }

  // --- HOST ENDPOINTS ---

  public async getMyProperties(req: Request, res: Response) {
    const user = req.currentUser!;
    const queryDto = getAllPropertiesQuerySchema.parse(req.query);

    const properties = await this._propertyService.getPropertiesByHostId(user.id, queryDto);

    res.status(200).json(properties);
  }

  public async createMyProperty(req: Request, res: Response) {
    const user = req.currentUser!;
    const createPropertyDto = createPropertyBodySchema.parse(req.body);

    const property = await this._propertyService.createProperty(user.id, createPropertyDto);

    res.status(201).json(property);
  }

  public async updateMyProperty(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);
    const updatePropertyDto = updatePropertyBodySchema.parse(req.body);

    const updatedProperty = await this._propertyService.updatePropertyByHost({
      hostId: user.id,
      propertyId,
      data: updatePropertyDto,
    });

    res.status(200).json(updatedProperty);
  }

  public async publishMyProperty(req: Request, res: Response) {
    const user = req.currentUser!;
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);

    const publishedProperty = await this._propertyService.publishPropertyByHost(
      user.id,
      propertyId,
    );

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

  // --- ADMIN ENDPOINTS ---

  public async adminGetAllProperties(req: Request, res: Response) {
    const queryDto = adminGetAllPropertiesQuerySchema.parse(req.query);
    const properties = await this._propertyService.adminGetProperties(queryDto);

    res.status(200).json(properties);
  }

  public async adminUpdateProperty(req: Request, res: Response) {
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);
    const updateDto = adminUpdatePropertyBodySchema.parse(req.body);

    const updatedProperty = await this._propertyService.adminUpdateProperty(propertyId, updateDto);

    res.status(200).json(updatedProperty);
  }

  public async adminDeleteProperty(req: Request, res: Response) {
    const { id: propertyId } = propertyIdParamSchema.parse(req.params);

    await this._propertyService.adminDeleteProperty(propertyId);

    res.status(204).send();
  }
}
