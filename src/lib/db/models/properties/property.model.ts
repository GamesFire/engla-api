import { Model, type Pojo, type RelationMappings } from 'objection';

import { AmenityModel } from '../amenities/amenity.model.js';
import { BaseSystemModel } from '../base-system.model.js';
import { PropertyImageModel } from '../property-image.model.js';
import { UserModel } from '../users/user.model.js';
import { PropertyModifiers } from './property.modifiers.js';

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
  INACTIVE = 'inactive',
  REJECTED = 'rejected',
  ARCHIVED = 'archived',
}

export enum CancellationPolicy {
  FLEXIBLE = 'flexible',
  MODERATE = 'moderate',
  STRICT = 'strict',
}

export interface Property {
  // --- System & Relations ---
  id: number;
  hostId: number; // FK to UserModel (id)
  status: PropertyStatus;

  // --- Basic Info ---
  propertyType: PropertyType;
  roomType: Nullable<RoomType>;
  title: Nullable<string>;
  description: Nullable<string>;

  // --- Location ---
  addressLine1: Nullable<string>;
  addressLine2: Nullable<string>;
  city: Nullable<string>;
  county: Nullable<string>;
  postcode: Nullable<string>;
  latitude: Nullable<number>;
  longitude: Nullable<number>;

  // --- Details & Capacity ---
  maxGuests: Nullable<number>;
  bedrooms: Nullable<number>;
  beds: Nullable<number>;
  bathrooms: Nullable<number>;
  areaSqM: Nullable<number>;

  // --- Rules & Policies ---
  checkInTime: Nullable<string>;
  checkOutTime: Nullable<string>;
  isPetsAllowed: Nullable<boolean>; // Default false
  houseRules: Nullable<string>;
  cancellationPolicy: Nullable<CancellationPolicy>;

  // --- Pricing ---
  pricePerNight: Nullable<number>;
  cleaningFee: Nullable<number>; // Default 0

  // --- Legal ---
  licenseNumber: Nullable<string>;

  // --- Timestamps ---
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Nullable<Date>;
}

export class PropertyModel extends BaseSystemModel implements Property {
  static tableName = 'properties';
  static modifiers = PropertyModifiers;

  id!: number;
  hostId!: number;
  status!: PropertyStatus;
  propertyType!: PropertyType;
  roomType!: Nullable<RoomType>;
  title!: Nullable<string>;
  description!: Nullable<string>;
  addressLine1!: Nullable<string>;
  addressLine2!: Nullable<string>;
  city!: Nullable<string>;
  county!: Nullable<string>;
  postcode!: Nullable<string>;
  latitude!: Nullable<number>; // !Important: pg returns decimal as string
  longitude!: Nullable<number>; // !Important: pg returns decimal as string
  maxGuests!: Nullable<number>;
  bedrooms!: Nullable<number>;
  beds!: Nullable<number>;
  bathrooms!: Nullable<number>;
  areaSqM!: Nullable<number>;
  checkInTime!: Nullable<string>;
  checkOutTime!: Nullable<string>;
  isPetsAllowed!: Nullable<boolean>;
  houseRules!: Nullable<string>;
  cancellationPolicy!: Nullable<CancellationPolicy>;
  pricePerNight!: Nullable<number>; // !Important: DB stores integer (in pence)
  cleaningFee!: Nullable<number>; // !Important: DB stores integer (in pence)
  licenseNumber!: Nullable<string>;

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
