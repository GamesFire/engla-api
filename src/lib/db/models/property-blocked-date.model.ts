import dayjs from 'dayjs';
import { type Pojo } from 'objection';

import { BaseSystemModel } from './base-system.model.js';

export interface PropertyBlockedDate {
  // --- System & Relations ---
  id: number;
  propertyId: number; // FK to PropertyModel (id)

  // --- Date Range & Details ---
  startDate: string; // YYYY-MM-DD (inclusive)
  endDate: string; // YYYY-MM-DD (exclusive)
  reason: Nullable<string>;

  // --- Timestamps ---
  createdAt: Date;
  updatedAt: Date;
}

export class PropertyBlockedDateModel extends BaseSystemModel implements PropertyBlockedDate {
  static tableName = 'property_blocked_dates';

  id!: number;
  propertyId!: number;
  startDate!: string; // !Important: pg returns date as Date object, normalized to YYYY-MM-DD
  endDate!: string; // !Important: pg returns date as Date object, normalized to YYYY-MM-DD
  reason!: Nullable<string>;

  // --- Modifiers for JSON (e.g., normalizing pg Date objects to YYYY-MM-DD strings) ---
  $parseDatabaseJson(json: Pojo): Pojo {
    json = super.$parseDatabaseJson(json);

    if (json.startDate) {
      json.startDate = dayjs(json.startDate as string | Date).format('YYYY-MM-DD');
    }
    if (json.endDate) {
      json.endDate = dayjs(json.endDate as string | Date).format('YYYY-MM-DD');
    }

    return json;
  }
}
