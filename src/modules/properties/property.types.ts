import type { Property } from '@models/properties/property.model.js';
import type { PropertyModifierName } from '@models/properties/property.modifiers.js';
import type { PropertyImage } from '@models/property-image.model.js';
import type {
  AdminGetAllPropertiesQueryDto,
  GetAllPropertiesQueryDto,
  UpdatePropertyBodyDto,
} from '@routes/properties/property.validation.js';

export type PropertyQueryOptions = {
  /**
   * Property modifiers to apply to the query result.
   * Behaviors:
   * - `undefined`: Defaults to **'publicView'** (Hides exact address).
   * - `null`: Returns **raw model** (All fields).
   * - `string` or `string[]`: Applies specific modifiers (e.g., `PropertyModifier.HOST_VIEW`).
   * @remarks Keys are strongly typed via {@link PropertyModifierName}.
   */
  modifiers?: Nullable<PropertyModifierName | PropertyModifierName[]>;

  /**
   * Whether to include soft-deleted properties.
   * @default false
   */
  includeDeleted?: boolean;
};

export type FindPropertyOptions = PropertyQueryOptions;

export type GetPublicPropertiesParams = GetAllPropertiesQueryDto;
export type AdminGetPropertiesParams = AdminGetAllPropertiesQueryDto;

export type CreatePropertyData = Pick<Property, 'hostId' | 'propertyType' | 'status'>;

export type InsertPropertyImageData = Pick<
  PropertyImage,
  'propertyId' | 'url' | 'publicId' | 'isMain' | 'order'
>;

export type UpdatePropertyParams = {
  propertyId: number;
  data: Partial<Property>;
  options?: PropertyQueryOptions;
};

export type GetExistingPropertyForHostParams = {
  propertyId: number;
  hostId: number;
  options?: FindPropertyOptions;
};

export type UpdatePropertyByHostParams = {
  hostId: number;
  propertyId: number;
  data: UpdatePropertyBodyDto;
};

export type UploadPropertyImagesParams = {
  files: Express.Multer.File[];
  hostId: number;
  propertyId: number;
};

export type ReorderPropertyImagesParams = {
  imageIds: number[];
  hostId: number;
  propertyId: number;
};

export type PropertyImageParams = {
  imageId: number;
  hostId: number;
  propertyId: number;
};
