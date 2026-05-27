import type { Modifiers, QueryBuilder } from 'objection';

import type { AmenityCategoryModel } from './amenity-category.model.js';

export const AmenityCategoryModifier = {
  /**
   * Fetches the category along with all its associated amenities.
   */
  WITH_AMENITIES: 'withAmenities',
} as const;

export type AmenityCategoryModifierName =
  (typeof AmenityCategoryModifier)[keyof typeof AmenityCategoryModifier];

export const AmenityCategoryModifiers: Modifiers<QueryBuilder<AmenityCategoryModel>> = {
  [AmenityCategoryModifier.WITH_AMENITIES](builder) {
    builder.withGraphFetched('amenities');
  },
};
