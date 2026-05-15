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
  id: number;
  scope: AmenityScope; // Default 'property'
  categoryId: Nullable<number>; // FK to AmenityCategoryModel (id)
  name: string;
  iconKey: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
}

export class AmenityModel extends BaseSystemModel implements Amenity {
  static tableName = 'amenities';
  static modifiers = AmenityModifiers;

  id!: number;
  scope!: AmenityScope;
  categoryId!: Nullable<number>;
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
