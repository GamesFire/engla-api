import type { Knex } from 'knex';

import { appConfig } from '@lib/configs/app.config.js';
import { logger } from '@lib/logger.js';

export async function seed(knex: Knex): Promise<void> {
  if (appConfig.isProd) {
    logger.info('[Seed] Skipping mock listings in production environment');
    return;
  }

  // Deletes ALL existing entries safely
  await knex.raw('TRUNCATE TABLE properties RESTART IDENTITY CASCADE');

  // --- PROPERTIES (15 Items) ---
  await knex('properties').insert([
    // ==========================================
    // LONDON & EDINBURGH (Demo Host - ID 2)
    // ==========================================
    {
      // 1. ACTIVE
      host_id: 2,
      status: 'active',
      property_type: 'apartment',
      room_type: 'entire_place',
      title: 'Luxury Penthouse with London Eye View',
      description:
        'Experience London in style with floor-to-ceiling windows and a private terrace.',
      address_line1: '10 Belvedere Road',
      address_line2: 'Penthouse Suite, 12th Floor',
      city: 'London',
      county: 'Greater London',
      postcode: 'SE1 7PB',
      latitude: 51.5033,
      longitude: -0.1195,
      max_guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      area_sq_m: 120,
      check_in_time: '15:00',
      check_out_time: '11:00',
      is_pets_allowed: false,
      house_rules:
        'Strictly no parties or events. Quiet hours from 11 PM to 7 AM. No smoking inside or on the balcony.',
      cancellation_policy: 'strict',
      price_per_night: 25000,
      cleaning_fee: 5000,
      license_number: 'STL-LND-2024-8832',
    },
    {
      // 2. ACTIVE
      host_id: 2,
      status: 'active',
      property_type: 'apartment',
      room_type: 'entire_place',
      title: 'Industrial Loft in Shoreditch',
      description:
        'Trendy exposed brick loft in the heart of East London. Steps away from the best cafes and nightlife.',
      address_line1: '15 Brick Lane',
      address_line2: 'Unit 4, The Old Brewery',
      city: 'London',
      county: 'Greater London',
      postcode: 'E1 6PU',
      latitude: 51.5207,
      longitude: -0.0722,
      max_guests: 3,
      bedrooms: 1,
      beds: 2,
      bathrooms: 1,
      area_sq_m: 85,
      check_in_time: '14:00',
      check_out_time: '11:00',
      is_pets_allowed: true,
      house_rules:
        'Well-behaved pets allowed. Please recycle using the provided bins in the courtyard.',
      cancellation_policy: 'moderate',
      price_per_night: 18000,
      cleaning_fee: 4000,
    },
    {
      // 3. ACTIVE
      host_id: 2,
      status: 'active',
      property_type: 'house',
      room_type: 'entire_place',
      title: 'Elegant Chelsea Townhouse',
      description:
        "Classic Victorian townhouse beautifully restored. Walk to the Saatchi Gallery and King's Road.",
      address_line1: "42 King's Road",
      city: 'London',
      county: 'Greater London',
      postcode: 'SW3 4UD',
      latitude: 51.4874,
      longitude: -0.161,
      max_guests: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 3,
      area_sq_m: 210,
      check_in_time: '16:00',
      check_out_time: '10:00',
      is_pets_allowed: false,
      house_rules:
        'Family-friendly neighborhood. Please respect our neighbors and keep noise down after 10 PM. No shoes on the upstairs carpets.',
      cancellation_policy: 'strict',
      price_per_night: 45000,
      cleaning_fee: 10000,
    },
    {
      // 4. INACTIVE
      host_id: 2,
      status: 'inactive',
      property_type: 'apartment',
      room_type: 'private_room',
      title: 'Sunny Double Room in Camden (Closed for Renovation)',
      description: 'A vibrant, artsy room in a shared flat just minutes from Camden Market.',
      address_line1: '12 Parkway',
      address_line2: 'Flat 2B',
      city: 'London',
      county: 'Greater London',
      postcode: 'NW1 7AH',
      latitude: 51.5386,
      longitude: -0.1432,
      max_guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      area_sq_m: 20,
      check_in_time: '13:00',
      check_out_time: '12:00',
      is_pets_allowed: false,
      house_rules: 'This is a shared space. Please clean up the kitchen and bathroom after use.',
      cancellation_policy: 'flexible',
      price_per_night: 6500,
      cleaning_fee: 1500,
    },
    {
      // 8. ACTIVE
      host_id: 2,
      status: 'active',
      property_type: 'guesthouse',
      room_type: 'private_room',
      title: 'Boutique Room near Edinburgh Castle',
      description: 'Charming private room in a historic Edinburgh guesthouse. Breakfast included.',
      address_line1: 'Royal Mile',
      address_line2: 'Room 3, First Floor',
      city: 'Edinburgh',
      county: 'Midlothian',
      postcode: 'EH1 2PB',
      latitude: 55.9486,
      longitude: -3.1999,
      max_guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      area_sq_m: 25,
      check_in_time: '14:00',
      check_out_time: '11:00',
      is_pets_allowed: false,
      house_rules: 'Breakfast is served in the main dining hall from 8:00 AM to 10:00 AM.',
      cancellation_policy: 'flexible',
      price_per_night: 8500,
      cleaning_fee: 1500,
      license_number: 'EDIN-B&B-1123',
    },
    {
      // 9. ACTIVE
      host_id: 2,
      status: 'active',
      property_type: 'apartment',
      room_type: 'entire_place',
      title: 'Modern New Town Apartment',
      description:
        'Sleek, minimalist design in the prestigious New Town area. Close to Princes Street.',
      address_line1: 'George Street',
      address_line2: 'Top Floor Flat',
      city: 'Edinburgh',
      county: 'Midlothian',
      postcode: 'EH2 2LR',
      latitude: 55.9533,
      longitude: -3.198,
      max_guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 1,
      area_sq_m: 90,
      check_in_time: '15:00',
      check_out_time: '11:00',
      is_pets_allowed: false,
      cancellation_policy: 'strict',
      price_per_night: 16000,
      cleaning_fee: 3500,
    },
    {
      // 10. ARCHIVED
      host_id: 2,
      status: 'archived',
      property_type: 'apartment',
      room_type: 'entire_place',
      title: 'Old Town Historic Vaults Flat (Archived Listing)',
      description:
        'A unique stay in a 16th-century building with original stone walls and modern amenities.',
      address_line1: 'Cowgate',
      city: 'Edinburgh',
      county: 'Midlothian',
      postcode: 'EH1 1JR',
      latitude: 55.9489,
      longitude: -3.1895,
      max_guests: 5,
      bedrooms: 2,
      beds: 3,
      bathrooms: 1,
      area_sq_m: 80,
      check_in_time: '15:00',
      check_out_time: '10:00',
      is_pets_allowed: false,
      cancellation_policy: 'moderate',
      price_per_night: 14000,
      cleaning_fee: 3000,
      deleted_at: knex.fn.now(),
    },

    // ==========================================
    // COTSWOLDS & MANCHESTER (David - Host 5)
    // ==========================================
    {
      // 5. ACTIVE
      host_id: 5,
      status: 'active',
      property_type: 'house',
      room_type: 'entire_place',
      title: 'Cozy Stone Cottage in the Cotswolds',
      description:
        'A beautifully restored 18th-century stone cottage with an indoor fireplace and gorgeous garden.',
      address_line1: 'High Street',
      city: 'Bourton-on-the-Water',
      county: 'Gloucestershire',
      postcode: 'GL54 2AQ',
      latitude: 51.8833,
      longitude: -1.75,
      max_guests: 6,
      bedrooms: 3,
      beds: 4,
      bathrooms: 2,
      area_sq_m: 140,
      check_in_time: '16:00',
      check_out_time: '10:00',
      is_pets_allowed: true,
      house_rules:
        'Dogs are welcome! Please wipe their paws after muddy walks using the towels provided in the porch.',
      cancellation_policy: 'moderate',
      price_per_night: 18000,
      cleaning_fee: 4000,
    },
    {
      // 6. ACTIVE
      host_id: 5,
      status: 'active',
      property_type: 'house',
      room_type: 'entire_place',
      title: 'Secluded Barn Conversion',
      description:
        'Stunning double-height ceilings, underfloor heating, and miles of private walking trails.',
      address_line1: 'Farm Track 1',
      address_line2: 'The Old Stables',
      city: 'Stow-on-the-Wold',
      county: 'Gloucestershire',
      postcode: 'GL54 1AL',
      latitude: 51.9295,
      longitude: -1.7214,
      max_guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 2,
      area_sq_m: 160,
      check_in_time: '15:00',
      check_out_time: '11:00',
      is_pets_allowed: true,
      house_rules: 'No open fires outside the designated fire pit area due to dry grass.',
      cancellation_policy: 'moderate',
      price_per_night: 22000,
      cleaning_fee: 4500,
    },
    {
      // 7. PENDING
      host_id: 5,
      status: 'pending',
      property_type: 'house',
      room_type: 'entire_place',
      title: 'Lakeside Cabin Retreat',
      description:
        "Unplug and unwind in this remote wooden cabin right on the water's edge in the Lake District.",
      address_line1: 'Windermere Shores',
      city: 'Windermere',
      county: 'Cumbria',
      postcode: 'LA23 1AH',
      latitude: 54.3739,
      longitude: -2.9062,
      max_guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      area_sq_m: 45,
      check_in_time: '14:00',
      check_out_time: '10:00',
      is_pets_allowed: true,
      cancellation_policy: 'flexible',
      price_per_night: 12000,
      cleaning_fee: 3000,
    },
    {
      // 14. REJECTED
      host_id: 5,
      status: 'rejected',
      property_type: 'apartment',
      room_type: 'entire_place',
      title: 'Northern Quarter Design Studio',
      description:
        'Open plan studio surrounded by vintage shops, street art, and independent cafes.',
      address_line1: 'Thomas Street',
      city: 'Manchester',
      county: 'Greater Manchester',
      postcode: 'M4 1EU',
      latitude: 53.4831,
      longitude: -2.2372,
      max_guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      area_sq_m: 55,
      check_in_time: '14:00',
      check_out_time: '11:00',
      is_pets_allowed: false,
      cancellation_policy: 'moderate',
      price_per_night: 11000,
      cleaning_fee: 2500,
    },
    {
      // 15. ACTIVE
      host_id: 5,
      status: 'active',
      property_type: 'apartment',
      room_type: 'entire_place',
      title: 'Spacious Deansgate Apartment',
      description: 'High-rise apartment with skyline views, gym access, and a concierge.',
      address_line1: 'Deansgate',
      address_line2: 'Apartment 401',
      city: 'Manchester',
      county: 'Greater Manchester',
      postcode: 'M3 4EN',
      latitude: 53.4754,
      longitude: -2.2505,
      max_guests: 6,
      bedrooms: 3,
      beds: 3,
      bathrooms: 2,
      area_sq_m: 110,
      check_in_time: '15:00',
      check_out_time: '11:00',
      is_pets_allowed: false,
      house_rules: 'The building has a strict noise policy. Concierge will report disturbances.',
      cancellation_policy: 'strict',
      price_per_night: 19000,
      cleaning_fee: 4500,
    },

    // ==========================================
    // CORNWALL (Emma - Host 6)
    // ==========================================
    {
      // 11. ACTIVE
      host_id: 6,
      status: 'active',
      property_type: 'house',
      room_type: 'entire_place',
      title: 'Cliffside Ocean View Villa',
      description: 'Panoramic sea views, private pool, and direct access to a secluded beach.',
      address_line1: 'Cliff Road',
      address_line2: 'Plot 3, Ocean View Estate',
      city: 'St Ives',
      county: 'Cornwall',
      postcode: 'TR26 2AB',
      latitude: 50.2132,
      longitude: -5.48,
      max_guests: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 3,
      area_sq_m: 250,
      check_in_time: '16:00',
      check_out_time: '10:00',
      is_pets_allowed: false,
      house_rules:
        'Please use the outdoor shower to wash off sand before entering the villa or pool.',
      cancellation_policy: 'strict',
      price_per_night: 55000,
      cleaning_fee: 12000,
    },
    {
      // 12. DRAFT
      host_id: 6,
      status: 'draft',
      property_type: 'guesthouse',
      room_type: 'entire_place',
      title: "Surfer's Paradise Shack (Draft)",
      description:
        'Rustic but comfortable wooden shack right on Fistral Beach. Work in progress...',
      address_line1: 'Fistral Beach',
      city: 'Newquay',
      county: 'Cornwall',
      postcode: 'TR7 1HY',
      latitude: 50.4158,
      longitude: -5.0991,
      max_guests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: null,
      area_sq_m: 35,
      check_in_time: null,
      check_out_time: null,
      is_pets_allowed: true,
      cancellation_policy: null,
      price_per_night: null,
      cleaning_fee: 0,
    },
    {
      // 13. ACTIVE
      host_id: 6,
      status: 'active',
      property_type: 'apartment',
      room_type: 'entire_place',
      title: 'Harbor View Flat',
      description:
        'Watch the fishing boats come in from your living room window in this charming coastal flat.',
      address_line1: 'The Wharf',
      address_line2: 'Apt 2',
      city: 'Falmouth',
      county: 'Cornwall',
      postcode: 'TR11 3AB',
      latitude: 50.1534,
      longitude: -5.0664,
      max_guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 1,
      area_sq_m: 75,
      check_in_time: '15:00',
      check_out_time: '10:00',
      is_pets_allowed: false,
      house_rules: 'Keep windows closed when leaving due to seagulls.',
      cancellation_policy: 'moderate',
      price_per_night: 13000,
      cleaning_fee: 3000,
    },
  ]);

  // --- PROPERTY IMAGES (58 Images) ---
  const propertiesImagesData = [
    // 1. London Penthouse (5 images: Luxury, views, modern)
    [
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235468/prop1_living_room_gxg3wg.jpg',
        desc: 'Luxury living room with city view',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235479/prop1_bedroom_wdxxsm.jpg',
        desc: 'Modern master bedroom',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235484/prop1_kitchen_nphbuv.jpg',
        desc: 'Sleek modern kitchen',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235495/prop1_bathroom_kk0dxa.jpg',
        desc: 'Luxury bathroom with tub',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235500/prop1_view_from_window_f5i7hx.jpg',
        desc: 'Night city view from window',
      },
    ],
    // 2. Shoreditch Loft (4 images: Brick, industrial, studio)
    [
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235508/prop2_living_area_jvv4o9.jpg',
        desc: 'Exposed brick living area',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235519/prop2_loft_interior_h86nki.jpg',
        desc: 'Industrial loft interior',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235524/prop2_loft_dining_space_gihufx.jpg',
        desc: 'Loft dining space',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235530/prop2_studio_workspace_corner_dugqfh.jpg',
        desc: 'Studio workspace corner',
      },
    ],
    // 3. Chelsea Townhouse (6 images: Classic, elegant, Victorian)
    [
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235566/prop3_dining_room_mg5rev.jpg',
        desc: 'Classic elegant dining room',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235579/prop3_living_room_nzzwii.jpg',
        desc: 'Victorian living room',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235583/prop3_facade_exterior_lm8m7n.jpg',
        desc: 'Townhouse brick facade exterior',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235596/prop3_bright_bedroom_tr0ue0.jpg',
        desc: 'Elegant bright bedroom',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235610/prop3_marble_bathroom_dn6ne6.jpg',
        desc: 'Luxury marble bathroom',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235615/prop3_cozy_reading_corner_dvfjt7.jpg',
        desc: 'Cozy reading corner',
      },
    ],
    // 4. Camden Room (2 images: Artsy, simple)
    [
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235628/prop4_cozy_colorful_bedroom_enqrlc.jpg',
        desc: 'Cozy colorful bedroom',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235633/prop4_artsy_room_detail_rdbkgq.jpg',
        desc: 'Artsy room detail/decor',
      },
    ],
    // 5. Cotswolds Cottage (7 images: Stone, fireplace, garden, cozy)
    [
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235660/prop5_stone_cottage_exterior_ol3abj.jpg',
        desc: 'Classic stone cottage exterior',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235675/prop5_living_room_with_fireplace_h4em87.jpg',
        desc: 'Cozy living room with fireplace',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235691/prop5_rustic_country_bedroom_d8upyt.jpg',
        desc: 'Rustic country bedroom',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235700/prop5_country_style_kitchen_w4axx3.jpg',
        desc: 'Country style kitchen',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235708/prop5_green_garden_path_nb44kr.jpg',
        desc: 'Green garden path',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235714/prop5_cotswolds_village_view_iu6aab.jpg',
        desc: 'Cotswolds village view',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235723/prop5_rustic_interior_detail_ctyret.jpg',
        desc: 'Rustic interior detail',
      },
    ],
    // 6. Barn Conversion (4 images: Wood, high ceilings, rural)
    [
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235743/prop6_ceiling_barn_interior_aad526.jpg',
        desc: 'High ceiling barn interior',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235758/prop6_wooden_interior_architecture_imbzlk.jpg',
        desc: 'Wooden interior architecture',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235764/prop6_rural_green_field_view_jk16xe.jpg',
        desc: 'Rural green field view',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235770/prop6_rustic_dining_table_xszwpl.jpg',
        desc: 'Rustic dining table',
      },
    ],
    // 7. Lake Cabin (3 images: Lake, wooden, deck)
    [
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235780/prop7_wooden_cabin_by_the_lake_smckci.jpg',
        desc: 'Wooden cabin by the lake',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235785/prop7_cozy_cabin_interior_kgykkm.jpg',
        desc: 'Cozy cabin interior',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235790/prop7_lake_view_from_wooden_deck_ctukfb.jpg',
        desc: 'Lake view from wooden deck',
      },
    ],
    // 8. Edinburgh Room (2 images: Historic, B&B vibe)
    [
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235806/prop8_historic_style_guest_bedroom_ouhoqk.jpg',
        desc: 'Historic style guest bedroom',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235812/prop8_guesthouse_breakfast_area_okvaid.jpg',
        desc: 'Guesthouse breakfast area',
      },
    ],
    // 9. New Town Apt (4 images: Minimalist, clean, bright)
    [
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235823/prop9_minimalist_bright_living_room_q8apfi.jpg',
        desc: 'Minimalist bright living room',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235835/prop9_sleek_bedroom_xnxsv5.jpg',
        desc: 'Sleek office/bedroom',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235843/prop9_clean_minimalist_kitchen_mjsxl2.jpg',
        desc: 'Clean minimalist kitchen',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235850/prop9_modern_minimal_bathroom_l5upyr.jpg',
        desc: 'Modern minimal bathroom',
      },
    ],
    // 10. Historic Vaults (3 images: Stone arches, dark, cozy)
    [
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235862/prop10_stone_arched_interior_mehege.jpg',
        desc: 'Stone arched interior',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235869/prop10_old_town_street_view_hax7wo.jpg',
        desc: 'Old town street view',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235875/prop10_bedroom_with_stone_walls_pv0muj.jpg',
        desc: 'Cozy bedroom with stone walls',
      },
    ],
    // 11. St Ives Villa (5 images: Pool, ocean, bright, luxury)
    [
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235886/prop11_luxury_coastal_villa_pool_nbzpyl.jpg',
        desc: 'Luxury coastal villa pool',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235897/prop11_sea_view_from_living_room_arpmqz.jpg',
        desc: 'Sea view from living room',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778235919/prop11_bright_bedroom_looking_at_sea_tr4baz.jpg',
        desc: 'Bright bedroom looking at sea',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778236200/prop11_sea_view_outdoor_terrace_oifkn7.jpg',
        desc: 'Sea view outdoor terrace',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778236210/prop11_luxury_bath_with_ocean_vibe_nivimu.jpg',
        desc: 'Luxury bath with ocean vibe',
      },
    ],
    // 12. Surfer Shack (3 images: Beach, surfboards, rustic wood)
    [
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778236221/prop12_wooden_beach_shack_exterior_jta5ep.jpg',
        desc: 'Wooden beach shack exterior',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778236227/prop12_rustic_surf_interior_pznjdt.jpg',
        desc: 'Rustic surf interior',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778236233/prop12_fistral_beach_view_x1iaqd.jpg',
        desc: 'Fistral beach view',
      },
    ],
    // 13. Falmouth Flat (3 images: Coastal, harbor, nautical)
    [
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778236239/prop13_coastal_flat_living_area_nkvix4.jpg',
        desc: 'Coastal flat living area',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778236246/prop13_harbor_view_out_window_fcwb4m.jpg',
        desc: 'Harbor view out window',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778236252/prop13_nautical_themed_bedroom_tdykm4.jpg',
        desc: 'Nautical themed bedroom',
      },
    ],
    // 14. Manchester Studio (3 images: Urban, street art, modern)
    [
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778236262/prop14_modern_studio_flat_juwfva.jpg',
        desc: 'Modern studio flat',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778236270/prop14_industrial_studio_bed_nqod8f.jpg',
        desc: 'Industrial studio bed',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778236275/prop14_urban_street_view_from_window_ep6j4a.jpg',
        desc: 'Urban street view from window',
      },
    ],
    // 15. Deansgate Apt (4 images: High-rise, city lights, sleek)
    [
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778236290/prop15_high_rise_apartment_living_room_nsmxh1.jpg',
        desc: 'High rise apartment living room',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778236295/prop15_modern_sleek_bedroom_qsmbyc.jpg',
        desc: 'Modern sleek bedroom',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778236304/prop15_city_lights_from_high_rise_dtxf7y.jpg',
        desc: 'City lights from high rise',
      },
      {
        url: 'https://res.cloudinary.com/dgsghju4q/image/upload/v1778236310/prop15_city_lights_from_high_rise_window_cdlapo.jpg',
        desc: 'City lights from high rise window',
      },
    ],
  ];

  const imagesToInsert: {
    property_id: number;
    url: string;
    public_id: Nullable<string>;
    is_main: boolean;
    order: number;
  }[] = [];

  propertiesImagesData.forEach((propertyImages, index) => {
    const propertyId = index + 1;

    propertyImages.forEach((image, imageIndex) => {
      imagesToInsert.push({
        property_id: propertyId,
        url: image.url,
        public_id: null,
        is_main: imageIndex === 0,
        order: imageIndex,
      });
    });
  });

  await knex('property_images').insert(imagesToInsert);

  // --- PROPERTIES AMENITIES ---
  const propertyAmenities: {
    property_id: number;
    amenity_id: number;
  }[] = [];

  // Add basic amenities to every properties (Wifi: 1, Towels: 3)
  for (let i = 1; i <= 15; i++) {
    propertyAmenities.push({ property_id: i, amenity_id: 1 }, { property_id: i, amenity_id: 3 });
  }

  // Add specific amenities to specific properties
  const extras = [
    [2, 5, 19, 22, 34], // 1 (Penthouse) Workspace, Kitchen, TV, AC, Hot tub
    [5, 19, 39], // 2 (Loft)
    [5, 11, 14, 19], // 3 (Townhouse)
    [11, 24], // 4 (Room)
    [23, 30, 31, 32, 5, 15], // 5 (Cottage) Fireplace, Yard, BBQ, Parking, Kitchen, Washer
    [23, 32, 5], // 6 (Barn)
    [23, 31, 32], // 7 (Cabin)
    [11, 24, 38], // 8 (Edinburgh Room)
    [5, 19, 24], // 9 (New Town)
    [19, 24], // 10 (Vaults)
    [5, 19, 30, 34, 32], // 11 (Villa) Pool, Hot tub, Parking
    [30, 31], // 12 (Shack)
    [5, 19], // 13 (Falmouth)
    [2, 5], // 14 (Studio) Workspace
    [5, 19, 36], // 15 (Deansgate) Gym
  ];

  extras.forEach((amenityArray, index) => {
    amenityArray.forEach((amenityId) => {
      propertyAmenities.push({ property_id: index + 1, amenity_id: amenityId });
    });
  });

  await knex('properties_amenities').insert(propertyAmenities);

  logger.info(
    `[Seed] 15 Mock properties, ${imagesToInsert.length} unique images, and 120+ amenities created successfully`,
  );
}
