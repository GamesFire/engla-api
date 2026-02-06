import { Model } from 'objection';

export class BaseSystemModel extends Model {
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Nullable<Date>;

  $beforeInsert() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  $beforeUpdate() {
    this.updatedAt = new Date();
  }
}
