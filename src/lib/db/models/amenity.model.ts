import { BaseSystemModel } from './base-system.model.js';

export interface IAmenity {
  id: number;
  name: string;
  iconKey: Nullable<string>;
  category: Nullable<string>;
  createdAt: Date;
  updatedAt: Date;
}

export class AmenityModel extends BaseSystemModel implements IAmenity {
  static tableName = 'amenities';

  id!: number;
  name!: string;
  iconKey!: Nullable<string>;
  category!: Nullable<string>;
}
