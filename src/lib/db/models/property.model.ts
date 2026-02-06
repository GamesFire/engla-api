import { Model, type Pojo, type RelationMappings } from 'objection';

import { AmenityModel } from './amenity.model.js';
import { BaseSystemModel } from './base-system.model.js';
import { PropertyImageModel } from './property-image.model.js';
import { UserModel } from './users/user.model.js';

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  GUESTHOUSE = 'guesthouse',
  HOTEL = 'hotel',
}

export enum RoomType {
  ENTIRE_PLACE = 'entire_place',
  PRIVATE_ROOM = 'private_room',
  SHARED_ROOM = 'shared_room',
}

export enum PropertyStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export interface IProperty {
  id: number;
  hostId: number; // FK to UserModel (id)
  title: string;
  description: string;
  addressLine1: string;
  addressLine2: Nullable<string>;
  city: string;
  county: Nullable<string>;
  postcode: string;
  latitude: Nullable<number>;
  longitude: Nullable<number>;
  pricePerNight: number;
  cleaningFee: number; // Default 0
  propertyType: PropertyType;
  roomType: RoomType;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  areaSqM: Nullable<number>;
  isPetsAllowed: boolean; // Default false
  status: PropertyStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Nullable<Date>;
}

export class PropertyModel extends BaseSystemModel implements IProperty {
  static tableName = 'properties';

  id!: number;
  hostId!: number;
  title!: string;
  description!: string;
  addressLine1!: string;
  addressLine2!: Nullable<string>;
  city!: string;
  county!: Nullable<string>;
  postcode!: string;
  latitude!: Nullable<number>; // !Important: pg returns decimal as string
  longitude!: Nullable<number>; // !Important: pg returns decimal as string
  pricePerNight!: number; // !Important: DB stores integer (in pence)
  cleaningFee!: number; // !Important: DB stores integer (in pence)
  propertyType!: PropertyType;
  roomType!: RoomType;
  maxGuests!: number;
  bedrooms!: number;
  beds!: number;
  bathrooms!: number;
  areaSqM!: Nullable<number>;
  isPetsAllowed!: boolean;
  status!: PropertyStatus;

  // --- Relations ---
  host?: UserModel;
  images?: PropertyImageModel[];
  amenities?: AmenityModel[];

  // --- Relation Mappings (For Objection) ---
  static get relationMappings(): RelationMappings {
    return {
      host: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: 'properties.hostId',
          to: 'users.id',
        },
      },

      images: {
        relation: Model.HasManyRelation,
        modelClass: PropertyImageModel,
        join: {
          from: 'properties.id',
          to: 'property_images.propertyId',
        },
      },

      amenities: {
        relation: Model.ManyToManyRelation,
        modelClass: AmenityModel,
        join: {
          from: 'properties.id',
          through: {
            from: 'properties_amenities.propertyId',
            to: 'properties_amenities.amenityId',
          },
          to: 'amenities.id',
        },
      },
    };
  }

  // --- Modifiers for JSON (e.g., to cast decimal strings to numbers) ---
  $afterFind(json: Pojo) {
    if (json.latitude) json.latitude = parseFloat(json.latitude as string);
    if (json.longitude) json.longitude = parseFloat(json.longitude as string);
  }
}
