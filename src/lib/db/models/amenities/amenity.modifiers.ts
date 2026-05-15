import type { Modifiers, QueryBuilder } from 'objection';

import type { AmenityModel } from './amenity.model.js';

export const AmenityModifier = {
  /**
   * Fetches the amenity along with its parent category details.
   */
  WITH_CATEGORY: 'withCategory',
} as const;

export type AmenityModifierName = (typeof AmenityModifier)[keyof typeof AmenityModifier];

export const AmenityModifiers: Modifiers<QueryBuilder<AmenityModel>> = {
  [AmenityModifier.WITH_CATEGORY](builder) {
    builder.withGraphFetched('category');
  },
};
