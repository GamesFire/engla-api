import type { Property } from '@models/properties/property.model.js';

export const PropertySortFields = ['createdAt', 'pricePerNight', 'title'] as const;

export const PropertyRules = {
  /**
   * Fields that represent the physical location of the property.
   * Modifying any of these fields is strictly forbidden once the property leaves the DRAFT state.
   */
  LOCATION_FIELDS: [
    'addressLine1',
    'addressLine2',
    'city',
    'county',
    'postcode',
    'latitude',
    'longitude',
  ] as const satisfies readonly (keyof Property)[],

  /**
   * Core fields that MUST be completely filled out before a DRAFT can be published.
   * Note: 'propertyType' is not here because it is strictly required upon initial creation.
   */
  REQUIRED_FOR_PUBLISHING: [
    'title',
    'description',
    'addressLine1',
    'city',
    'postcode',
    'pricePerNight',
    'roomType',
    'maxGuests',
    'bedrooms',
    'beds',
    'bathrooms',
    'checkInTime',
    'checkOutTime',
    'cancellationPolicy',
  ] as const satisfies readonly (keyof Property)[],

  /**
   * Conditional or virtual fields required for publishing, evaluated dynamically.
   */
  DYNAMIC_PUBLISH_FIELDS: {
    LICENSE: 'licenseNumber', // Required only for 'hotel' property types
    IMAGES: 'images', // Virtual relation field: at least 1 image is required
  },
} as const;
