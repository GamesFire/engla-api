import type { Knex } from 'knex';

import { logger } from '@lib/logger.js';

export async function seed(knex: Knex): Promise<void> {
  // !CRITICAL: We DO NOT use TRUNCATE here.
  // Truncating with CASCADE would wipe out all assigned amenities in 'properties_amenities'.
  // Upsert guarantees production safety.

  const amenities = [
    // Essentials (1)
    { category_id: 1, name: 'Wifi', icon_key: 'wifi', scope: 'property' },
    { category_id: 1, name: 'Dedicated workspace', icon_key: 'laptop', scope: 'property' },
    { category_id: 1, name: 'Towels and bed sheets', icon_key: 'bed', scope: 'property' },
    { category_id: 1, name: 'Iron', icon_key: 'iron', scope: 'property' },

    // Kitchen & Dining (2)
    { category_id: 2, name: 'Kitchen', icon_key: 'kitchen', scope: 'property' },
    { category_id: 2, name: 'Refrigerator', icon_key: 'fridge', scope: 'property' },
    { category_id: 2, name: 'Microwave', icon_key: 'microwave', scope: 'property' },
    { category_id: 2, name: 'Coffee maker', icon_key: 'coffee', scope: 'property' },
    { category_id: 2, name: 'Dishwasher', icon_key: 'dishwasher', scope: 'property' },
    { category_id: 2, name: 'Pots and pans', icon_key: 'pot', scope: 'property' },

    // Bathroom (3)
    { category_id: 3, name: 'Hair dryer', icon_key: 'hair_dryer', scope: 'property' },
    { category_id: 3, name: 'Shampoo & Conditioner', icon_key: 'shampoo', scope: 'property' },
    { category_id: 3, name: 'Hot water', icon_key: 'hot_water', scope: 'property' },
    { category_id: 3, name: 'Bathtub', icon_key: 'bathtub', scope: 'property' },

    // Bedroom & Laundry (4)
    { category_id: 4, name: 'Washer', icon_key: 'washer', scope: 'property' },
    { category_id: 4, name: 'Dryer', icon_key: 'dryer', scope: 'property' },
    { category_id: 4, name: 'Extra pillows and blankets', icon_key: 'pillow', scope: 'property' },
    { category_id: 4, name: 'Room-darkening shades', icon_key: 'blinds', scope: 'property' },

    // Entertainment (5)
    { category_id: 5, name: 'TV', icon_key: 'tv', scope: 'property' },
    { category_id: 5, name: 'Bluetooth sound system', icon_key: 'speaker', scope: 'property' },
    { category_id: 5, name: 'Board games', icon_key: 'games', scope: 'property' },

    // Heating & Cooling (6)
    { category_id: 6, name: 'Air conditioning', icon_key: 'ac', scope: 'property' },
    { category_id: 6, name: 'Indoor fireplace', icon_key: 'fireplace', scope: 'property' },
    { category_id: 6, name: 'Central heating', icon_key: 'heating', scope: 'property' },

    // Safety (7)
    { category_id: 7, name: 'Smoke alarm', icon_key: 'smoke_alarm', scope: 'property' },
    { category_id: 7, name: 'Carbon monoxide alarm', icon_key: 'co2_alarm', scope: 'property' },
    { category_id: 7, name: 'Fire extinguisher', icon_key: 'extinguisher', scope: 'property' },
    { category_id: 7, name: 'First aid kit', icon_key: 'first_aid', scope: 'property' },

    // Outdoors (8)
    { category_id: 8, name: 'Patio or balcony', icon_key: 'patio', scope: 'property' },
    { category_id: 8, name: 'Backyard', icon_key: 'yard', scope: 'property' },
    { category_id: 8, name: 'BBQ grill', icon_key: 'grill', scope: 'property' },
    { category_id: 8, name: 'Outdoor furniture', icon_key: 'sunbed', scope: 'property' },

    // Facilities (9)
    { category_id: 9, name: 'Free parking on premises', icon_key: 'parking', scope: 'property' },
    { category_id: 9, name: 'EV charger', icon_key: 'ev_charger', scope: 'property' },
    { category_id: 9, name: 'Private pool', icon_key: 'pool', scope: 'property' },
    { category_id: 9, name: 'Hot tub', icon_key: 'hot_tub', scope: 'property' },
    { category_id: 9, name: 'Gym', icon_key: 'gym', scope: 'property' },

    // Services (10)
    { category_id: 10, name: 'Self check-in', icon_key: 'keybox', scope: 'property' },
    { category_id: 10, name: 'Luggage dropoff allowed', icon_key: 'luggage', scope: 'property' },
    { category_id: 10, name: 'Long term stays allowed', icon_key: 'calendar', scope: 'property' },
  ];

  await knex('amenities')
    .insert(amenities)
    .onConflict('name') // 'name' must be UNIQUE in the schema
    .merge(); // Updates icon_key and scope if they changed

  logger.info(`[Seed] System amenities verified/inserted (${amenities.length} total)`);
}
