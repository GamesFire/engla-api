import type { Property } from '@models/properties/property.model.js';

export const PropertyConstants = {
  /**
   * Fields that represent the physical location of the property.
   * Modifying any of these fields is forbidden once the property leaves the DRAFT state.
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
   * Fields that MUST be completely filled out before a DRAFT can be published.
   * Note: 'propertyType' is not here because it is strictly required upon creation.
   * Note: 'licenseNumber' is dynamically required only for 'hotel' property types.
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
} as const;
