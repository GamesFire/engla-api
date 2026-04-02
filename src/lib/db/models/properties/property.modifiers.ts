import type { Modifiers, QueryBuilder } from 'objection';

import type { PropertyModel } from './property.model.js';

export const PropertyModifier = {
  /**
   * Safe view for public searches and guests.
   * - HIDES: addressLine1, addressLine2, postcode, deletedAt.
   * - INCLUDES: Public host info, main image (or all images), amenities.
   */
  PUBLIC_VIEW: 'publicView',

  /**
   * View for the host who owns the property.
   * - INCLUDES: Everything (exact address, financial details).
   */
  HOST_VIEW: 'hostView',

  /**
   * View for admin panel.
   * - INCLUDES: Everything + deep relations (e.g., full host details).
   */
  ADMIN_VIEW: 'adminView',
} as const;

export type PropertyModifierName = (typeof PropertyModifier)[keyof typeof PropertyModifier];

export const PropertyModifiers: Modifiers<QueryBuilder<PropertyModel>> = {
  [PropertyModifier.PUBLIC_VIEW](builder) {
    builder
      .select(
        'id',
        'hostId',
        'status',
        'propertyType',
        'roomType',
        'title',
        'description',
        'city',
        'county',
        'latitude',
        'longitude',
        'maxGuests',
        'bedrooms',
        'beds',
        'bathrooms',
        'areaSqM',
        'checkInTime',
        'checkOutTime',
        'houseRules',
        'cancellationPolicy',
        'isPetsAllowed',
        'pricePerNight',
        'cleaningFee',
        'licenseNumber',
        'createdAt',
        'updatedAt',
      )
      .withGraphFetched('[host(shortProfile), images, amenities]');
  },

  [PropertyModifier.HOST_VIEW](builder) {
    builder.withGraphFetched('[images, amenities]');
  },

  [PropertyModifier.ADMIN_VIEW](builder) {
    builder.withGraphFetched('[host, images, amenities]');
  },
};
