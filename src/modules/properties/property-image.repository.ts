import type { Transaction } from 'objection';

import { provide } from '@ioc/decorators.js';
import { type PropertyImage, PropertyImageModel } from '@models/property-image.model.js';

import type { InsertPropertyImageData } from './property.types.js';

@provide()
export class PropertyImageRepository {
  public async findByIdAndPropertyId(
    imageId: number,
    propertyId: number,
  ): Promise<Undefinable<PropertyImage>> {
    return PropertyImageModel.query().findOne({ id: imageId, propertyId });
  }

  public async findAllByPropertyId(propertyId: number): Promise<PropertyImage[]> {
    return PropertyImageModel.query().where({ propertyId }).orderBy('order', 'asc');
  }

  public async countByPropertyId(propertyId: number): Promise<number> {
    const result = await PropertyImageModel.query()
      .where({ propertyId })
      .count('id as count')
      .first();

    return Number((result as unknown as { count: string | number })?.count || 0);
  }

  public async insertMany(images: InsertPropertyImageData[]): Promise<PropertyImage[]> {
    return PropertyImageModel.query().insertGraph(images);
  }

  public async reorderImages(imageIds: number[], propertyId: number): Promise<void> {
    await PropertyImageModel.transaction(async (trx: Transaction) => {
      const updatePromises = imageIds.map((imageId, index) =>
        PropertyImageModel.query(trx).where({ id: imageId, propertyId }).patch({ order: index }),
      );

      await Promise.all(updatePromises);
    });
  }

  public async deleteById(imageId: number): Promise<void> {
    await PropertyImageModel.query().deleteById(imageId);
  }

  public async setMainImage(imageId: number, propertyId: number): Promise<void> {
    await PropertyImageModel.query().where({ propertyId }).patch({ isMain: false });
    await PropertyImageModel.query().findById(imageId).patch({ isMain: true });
  }
}
