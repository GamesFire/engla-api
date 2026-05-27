import { Model, type RelationMappings } from 'objection';

import { BaseSystemModel } from '../../base-system.model.js';
import { AmenityModel } from '../amenity.model.js';
import { AmenityCategoryModifiers } from './amenity-category.modifiers.js';

export interface AmenityCategory {
  id: number;
  name: string;
  description: Nullable<string>;
  order: number; // Default 0
  createdAt: Date;
  updatedAt: Date;

  // --- Relations ---
  amenities?: AmenityModel[];
}

export class AmenityCategoryModel extends BaseSystemModel implements AmenityCategory {
  static tableName = 'amenity_categories';
  static modifiers = AmenityCategoryModifiers;

  id!: number;
  name!: string;
  description!: Nullable<string>;
  order!: number;

  // --- Relations ---
  amenities?: AmenityModel[];

  // --- Relation Mappings (For Objection) ---
  static get relationMappings(): RelationMappings {
    return {
      amenities: {
        relation: Model.HasManyRelation,
        modelClass: AmenityModel,
        join: {
          from: 'amenity_categories.id',
          to: 'amenities.categoryId',
        },
      },
    };
  }
}
