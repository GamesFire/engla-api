import type { Property } from '@models/properties/property.model.js';
import type { PropertyModifierName } from '@models/properties/property.modifiers.js';
import type { PropertyImage } from '@models/property-image.model.js';
import type {
  AdminGetPropertiesQueryDto,
  GetPropertiesQueryDto,
  PublishPropertyBodyDto,
  ReorderPropertyImagesBodyDto,
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

export type GetPublicPropertiesParams = GetPropertiesQueryDto;
export type GetPropertiesByAdminParams = AdminGetPropertiesQueryDto;

export type CreatePropertyData = Pick<Property, 'hostId' | 'propertyType' | 'status'>;

export type InsertPropertyImageData = Pick<
  PropertyImage,
  'propertyId' | 'url' | 'publicId' | 'isMain' | 'order'
>;

export type UpdatePropertyData = Partial<Property> & {
  amenityIds?: number[];
};

export type UpdatePropertyParams = {
  propertyId: number;
  data: UpdatePropertyData;
  options?: PropertyQueryOptions;
};

export type GetExistingPropertyForHostParams = {
  hostId: number;
  propertyId: number;
  options?: FindPropertyOptions;
};

export type UpdatePropertyByHostParams = {
  hostId: number;
  propertyId: number;
  data: UpdatePropertyBodyDto;
};

export type PublishPropertyByHostParams = {
  hostId: number;
  propertyId: number;
  data: PublishPropertyBodyDto;
};

export type UploadPropertyImagesByHostParams = {
  hostId: number;
  propertyId: number;
  files: Express.Multer.File[];
};

export type ReorderPropertyImagesByHostParams = {
  hostId: number;
  propertyId: number;
  data: ReorderPropertyImagesBodyDto;
};

export type PropertyImageByHostParams = {
  hostId: number;
  propertyId: number;
  imageId: number;
};
