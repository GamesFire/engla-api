import { provide } from '@ioc/decorators.js';
import {
  type PropertyBlockedDate,
  PropertyBlockedDateModel,
} from '@models/property-blocked-date.model.js';
import type { GetPropertyAvailabilityQueryDto } from '@routes/properties/property.validation.js';

import type {
  CheckBlockedDatesOverlapParams,
  CreatePropertyBlockedDateData,
} from './property.types.js';

@provide()
export class PropertyBlockedDateRepository {
  // --- READ METHODS ---

  public async findByIdAndPropertyId(
    blockId: number,
    propertyId: number,
  ): Promise<Undefinable<PropertyBlockedDate>> {
    return PropertyBlockedDateModel.query().findOne({ id: blockId, propertyId });
  }

  public async findAllByPropertyId(
    propertyId: number,
    range?: GetPropertyAvailabilityQueryDto,
  ): Promise<PropertyBlockedDate[]> {
    const query = PropertyBlockedDateModel.query()
      .where({ propertyId })
      .orderBy('startDate', 'asc');

    if (range?.from) {
      query.where('endDate', '>', range.from);
    }

    if (range?.to) {
      query.where('startDate', '<', range.to);
    }

    return query;
  }

  public async hasOverlappingBlockedDates(
    params: CheckBlockedDatesOverlapParams,
  ): Promise<boolean> {
    const { propertyId, startDate, endDate, trx } = params;

    const existing = await PropertyBlockedDateModel.query(trx)
      .select('id')
      .where({ propertyId })
      .where('startDate', '<', endDate)
      .where('endDate', '>', startDate)
      .first();

    return Boolean(existing);
  }

  // --- WRITE METHODS ---

  public async createAndFetch(data: CreatePropertyBlockedDateData): Promise<PropertyBlockedDate> {
    const inserted = await PropertyBlockedDateModel.query().insert(data);
    return PropertyBlockedDateModel.query().findById(
      inserted.id,
    ) as unknown as Promise<PropertyBlockedDate>;
  }

  public async deleteById(blockId: number): Promise<void> {
    await PropertyBlockedDateModel.query().deleteById(blockId);
  }
}
