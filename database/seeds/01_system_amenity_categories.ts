import type { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex.raw('TRUNCATE TABLE amenity_categories RESTART IDENTITY CASCADE');

  // Inserts seed entries
  await knex('amenity_categories').insert([
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
  ]);
}
