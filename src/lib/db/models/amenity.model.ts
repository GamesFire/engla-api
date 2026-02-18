import { BaseSystemModel } from './base-system.model.js';

export interface Amenity {
  id: number;
  name: string;
  iconKey: Nullable<string>;
  category: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
}

export class AmenityModel extends BaseSystemModel implements Amenity {
  static tableName = 'amenities';

  id!: number;
  name!: string;
  iconKey!: Nullable<string>;
  category!: Nullable<string>;
}
