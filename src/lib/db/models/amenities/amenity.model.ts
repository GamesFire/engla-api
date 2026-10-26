import { Model, type RelationMappings } from 'objection';

import { BaseSystemModel } from '../base-system.model.js';
import { AmenityCategoryModel } from './amenity-categories/amenity-category.model.js';
import { AmenityModifiers } from './amenity.modifiers.js';

export enum AmenityScope {
  PROPERTY = 'property',
  EXPERIENCE = 'experience',
  VEHICLE = 'vehicle',
}

export interface Amenity {
  // --- System & Relations ---
  id: number;
  categoryId: Nullable<number>; // FK to AmenityCategoryModel (id)
  scope: AmenityScope; // Default 'property'

  // --- Basic Info ---
  name: string;
  iconKey: Nullable<string>;

  // --- Timestamps ---
  createdAt: Date;
  updatedAt: Date;

  // --- Relations ---
  category?: AmenityCategoryModel;
}

export class AmenityModel extends BaseSystemModel implements Amenity {
  static tableName = 'amenities';
  static modifiers = AmenityModifiers;

  id!: number;
  categoryId!: Nullable<number>;
  scope!: AmenityScope;
  name!: string;
  iconKey!: Nullable<string>;

  // --- Relations ---
  category?: AmenityCategoryModel;

  // --- Relation Mappings (For Objection) ---
  static get relationMappings(): RelationMappings {
    return {
      category: {
        relation: Model.BelongsToOneRelation,
        modelClass: AmenityCategoryModel,
        join: {
          from: 'amenities.categoryId',
          to: 'amenity_categories.id',
        },
      },
    };
  }
}
