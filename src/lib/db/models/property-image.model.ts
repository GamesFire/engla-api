import { BaseSystemModel } from './base-system.model.js';

export interface IPropertyImage {
  id: number;
  propertyId: number; // FK to PropertyModel (id)
  url: string;
  publicId: Nullable<string>;
  isMain: boolean; // Default false
  order: number; // Default 0
  createdAt: Date;
  updatedAt: Date;
}

export class PropertyImageModel extends BaseSystemModel implements IPropertyImage {
  static tableName = 'property_images';

  id!: number;
  propertyId!: number;
  url!: string;
  publicId!: Nullable<string>;
  isMain!: boolean;
  order!: number;
}
