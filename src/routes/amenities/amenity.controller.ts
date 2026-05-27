import type { Request, Response } from 'express';
import { inject } from 'inversify';

import { provide } from '@ioc/decorators.js';
import { AmenityService } from '@modules/amenities/amenity.service.js';

import {
  amenityCategoryIdParamSchema,
  amenityIdParamSchema,
  createAmenityBodySchema,
  createAmenityCategoryBodySchema,
  getAmenitiesQuerySchema,
  getAmenityCategoriesQuerySchema,
  updateAmenityBodySchema,
  updateAmenityCategoryBodySchema,
} from './amenity.validation.js';

@provide()
export class AmenityController {
  constructor(@inject(AmenityService) private readonly _amenityService: AmenityService) {
    this.getAmenityById = this.getAmenityById.bind(this);
    this.getAmenities = this.getAmenities.bind(this);
    this.getAmenityCategoryById = this.getAmenityCategoryById.bind(this);
    this.getAmenityCategories = this.getAmenityCategories.bind(this);

    this.adminCreateAmenity = this.adminCreateAmenity.bind(this);
    this.adminUpdateAmenity = this.adminUpdateAmenity.bind(this);
    this.adminDeleteAmenity = this.adminDeleteAmenity.bind(this);

    this.adminCreateAmenityCategory = this.adminCreateAmenityCategory.bind(this);
    this.adminUpdateAmenityCategory = this.adminUpdateAmenityCategory.bind(this);
    this.adminDeleteAmenityCategory = this.adminDeleteAmenityCategory.bind(this);
  }

  // --- PUBLIC ENDPOINTS ---

  public async getAmenityById(req: Request, res: Response) {
    const { id: amenityId } = amenityIdParamSchema.parse(req.params);
    const amenity = await this._amenityService.getAmenityById(amenityId);

    res.status(200).json(amenity);
  }

  public async getAmenities(req: Request, res: Response) {
    const getAmenitiesQueryDto = getAmenitiesQuerySchema.parse(req.query);
    const amenities = await this._amenityService.getAmenities(getAmenitiesQueryDto);

    res.status(200).json(amenities);
  }

  public async getAmenityCategoryById(req: Request, res: Response) {
    const { id: categoryId } = amenityCategoryIdParamSchema.parse(req.params);
    const amenityCategory = await this._amenityService.getAmenityCategoryById(categoryId);

    res.status(200).json(amenityCategory);
  }

  public async getAmenityCategories(req: Request, res: Response) {
    const getAmenityCategoriesQueryDto = getAmenityCategoriesQuerySchema.parse(req.query);
    const amenityCategories = await this._amenityService.getAmenityCategories(
      getAmenityCategoriesQueryDto,
    );

    res.status(200).json(amenityCategories);
  }

  // --- ADMIN ENDPOINTS (Amenities) ---

  public async adminCreateAmenity(req: Request, res: Response) {
    const createAmenityBodyDto = createAmenityBodySchema.parse(req.body);
    const amenity = await this._amenityService.createAmenity(createAmenityBodyDto);

    res.status(201).json(amenity);
  }

  public async adminUpdateAmenity(req: Request, res: Response) {
    const { id: amenityId } = amenityIdParamSchema.parse(req.params);
    const updateAmenityBodyDto = updateAmenityBodySchema.parse(req.body);

    const updatedAmenity = await this._amenityService.updateAmenity({
      amenityId,
      data: updateAmenityBodyDto,
    });

    res.status(200).json(updatedAmenity);
  }

  public async adminDeleteAmenity(req: Request, res: Response) {
    const { id: amenityId } = amenityIdParamSchema.parse(req.params);
    await this._amenityService.deleteAmenity(amenityId);

    res.status(204).send();
  }

  // --- ADMIN ENDPOINTS (Amenity Categories) ---

  public async adminCreateAmenityCategory(req: Request, res: Response) {
    const createAmenityCategoryBodyDto = createAmenityCategoryBodySchema.parse(req.body);
    const amenityCategory = await this._amenityService.createAmenityCategory(
      createAmenityCategoryBodyDto,
    );

    res.status(201).json(amenityCategory);
  }

  public async adminUpdateAmenityCategory(req: Request, res: Response) {
    const { id: categoryId } = amenityCategoryIdParamSchema.parse(req.params);
    const updateAmenityCategoryBodyDto = updateAmenityCategoryBodySchema.parse(req.body);

    const updatedAmenityCategory = await this._amenityService.updateAmenityCategory({
      categoryId,
      data: updateAmenityCategoryBodyDto,
    });

    res.status(200).json(updatedAmenityCategory);
  }

  public async adminDeleteAmenityCategory(req: Request, res: Response) {
    const { id: categoryId } = amenityCategoryIdParamSchema.parse(req.params);
    await this._amenityService.deleteAmenityCategory(categoryId);

    res.status(204).send();
  }
}
