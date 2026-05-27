import type { Knex } from 'knex';

import { logger } from '@lib/logger.js';

export async function seed(knex: Knex): Promise<void> {
  // !CRITICAL: We DO NOT use TRUNCATE here.
  // Using UPSERT ensures we can add new categories or fix typos in production
  // without destroying foreign key links to the 'amenities' table.

  const categories = [
    { name: 'Essentials', description: 'Basic items for a comfortable stay', order: 1 },
    { name: 'Kitchen & Dining', description: 'Cooking basics and appliances', order: 2 },
    { name: 'Bathroom', description: 'Bathroom amenities and toiletries', order: 3 },
    { name: 'Bedroom & Laundry', description: 'Sleeping arrangements and washing', order: 4 },
    { name: 'Entertainment', description: 'Media and leisure facilities', order: 5 },
    { name: 'Heating & Cooling', description: 'Temperature control', order: 6 },
    { name: 'Safety', description: 'Safety equipment and features', order: 7 },
    { name: 'Outdoors', description: 'Exterior features and spaces', order: 8 },
    { name: 'Facilities', description: 'Building features and shared spaces', order: 9 },
    { name: 'Services', description: 'Additional host services', order: 10 },
  ];

  await knex('amenity_categories')
    .insert(categories)
    .onConflict('name') // 'name' must be UNIQUE in the schema
    .merge(); // Updates description and order if they changed

  logger.info(`[Seed] System amenity categories verified/inserted (${categories.length} total)`);
}
