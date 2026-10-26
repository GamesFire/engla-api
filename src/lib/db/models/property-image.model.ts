import { BaseSystemModel } from './base-system.model.js';

export interface PropertyImage {
  // --- System & Relations ---
  id: number;
  propertyId: number; // FK to PropertyModel (id)

  // --- Media Details ---
  url: string;
  publicId: Nullable<string>;
  isMain: boolean; // Default false
  order: number; // Default 0

  // --- Timestamps ---
  createdAt: Date;
  updatedAt: Date;
}

export class PropertyImageModel extends BaseSystemModel implements PropertyImage {
  static tableName = 'property_images';

  id!: number;
  propertyId!: number;
  url!: string;
  publicId!: Nullable<string>;
  isMain!: boolean;
  order!: number;
}
