import type { AmenityCategory } from '@models/amenities/amenity-categories/amenity-category.model.js';
import type { AmenityCategoryModifierName } from '@models/amenities/amenity-categories/amenity-category.modifiers.js';
import type { Amenity } from '@models/amenities/amenity.model.js';
import type { AmenityModifierName } from '@models/amenities/amenity.modifiers.js';
import type {
  GetAmenitiesQueryDto,
  GetAmenityCategoriesQueryDto,
} from '@routes/amenities/amenity.validation.js';

export type AmenityQueryOptions = {
  /**
   * Modifiers to apply to the amenity query result.
   * Behaviors:
   * - `undefined`: Defaults to **'withCategory'** (Includes parent amenity category relation).
   * - `null`: Returns raw model (All fields, no relations).
   * - `string` or `string[]`: Applies specific modifiers.
   * @remarks Keys are strongly typed via {@link AmenityModifierName}.
   */
  modifiers?: Nullable<AmenityModifierName | AmenityModifierName[]>;
};

export type AmenityCategoryQueryOptions = {
  /**
   * Modifiers to apply to the amenity category query result.
   * Behaviors:
   * - `undefined`: Defaults to returning raw amenity category.
   * - `null`: Returns raw model (All fields).
   * - `string` or `string[]`: Applies specific modifiers (e.g., `AmenityCategoryModifier.WITH_AMENITIES`).
   * @remarks Keys are strongly typed via {@link AmenityCategoryModifierName}.
   */
  modifiers?: Nullable<AmenityCategoryModifierName | AmenityCategoryModifierName[]>;
};

export type GetAmenitiesParams = GetAmenitiesQueryDto;
export type GetAmenityCategoriesParams = GetAmenityCategoriesQueryDto;

export type CreateAmenityData = Pick<Amenity, 'name' | 'scope' | 'categoryId' | 'iconKey'>;

export type UpdateAmenityParams = {
  amenityId: number;
  data: Partial<CreateAmenityData>;
  options?: AmenityQueryOptions;
};

export type CreateAmenityCategoryData = Pick<AmenityCategory, 'name' | 'description' | 'order'>;

export type UpdateAmenityCategoryParams = {
  categoryId: number;
  data: Partial<CreateAmenityCategoryData>;
  options?: AmenityCategoryQueryOptions;
};
