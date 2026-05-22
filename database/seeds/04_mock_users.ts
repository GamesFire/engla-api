import type { Knex } from 'knex';

import { appConfig } from '@lib/configs/app.config.js';
import { logger } from '@lib/logger.js';

export async function seed(knex: Knex): Promise<void> {
  if (appConfig.isProd) {
    logger.info('[Seed] Skipping mock users in production environment');
    return;
  }

  // Deletes ALL existing entries safely
  await knex.raw('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

  // Inserts seed entries
  await knex('users').insert([
    // ==========================================
    // REAL ACCOUNTS (RESERVED)
    // ==========================================
    {
      // ID: 1 (Main Admin)
      auth0_id: appConfig.SEED_ADMIN_AUTH0_ID,
      email: appConfig.SEED_ADMIN_EMAIL,
      first_name: 'Main',
      last_name: 'Administrator',
      role: 'admin',
      is_verified: true,
      avatar_url:
        'https://res.cloudinary.com/dgsghju4q/image/upload/v1778154886/main_admin_avatar_t20iu7.jpg',
    },
    {
      // ID: 2 (Demo Host)
      auth0_id: appConfig.SEED_HOST_AUTH0_ID,
      email: appConfig.SEED_HOST_EMAIL,
      first_name: 'Demo',
      last_name: 'Host',
      role: 'host',
      is_verified: true,
      stripe_onboarding_completed: true,
      avatar_url:
        'https://res.cloudinary.com/dgsghju4q/image/upload/v1778154966/demo_host_be38rr.jpg',
    },

    // ==========================================
    // PLATFORM TEAM (STAFF ACCOUNTS)
    // ==========================================
    {
      // ID: 3
      auth0_id: 'auth0|staff_1',
      email: 'support@engla.com',
      first_name: 'Sarah',
      last_name: 'Connor',
      role: 'admin',
      is_verified: true,
      avatar_url:
        'https://res.cloudinary.com/dgsghju4q/image/upload/v1778154975/admin1_avatar_rytrqo.jpg',
    },
    {
      // ID: 4
      auth0_id: 'auth0|staff_2',
      email: 'moderator@engla.com',
      first_name: 'Jack',
      last_name: 'Ward',
      role: 'admin',
      is_verified: true,
      avatar_url:
        'https://res.cloudinary.com/dgsghju4q/image/upload/v1778154979/admin2_avatar_rlwz68.jpg',
    },

    // ==========================================
    // ADDITIONAL HOSTS
    // ==========================================
    {
      // ID: 5
      auth0_id: 'auth0|fake_host_1',
      email: 'cottages_rent@example.com',
      first_name: 'David',
      last_name: 'Smith',
      role: 'host',
      is_verified: true,
      stripe_onboarding_completed: true,
      avatar_url:
        'https://res.cloudinary.com/dgsghju4q/image/upload/v1778154987/host1_avatar_aiv9qv.jpg',
    },
    {
      // ID: 6
      auth0_id: 'auth0|fake_host_2',
      email: 'villas_luxury@example.com',
      first_name: 'Emma',
      last_name: 'Watson',
      role: 'host',
      is_verified: true,
      stripe_onboarding_completed: true,
      avatar_url:
        'https://res.cloudinary.com/dgsghju4q/image/upload/v1778154992/host2_avatar_php04y.jpg',
    },

    // ==========================================
    // MOCK CLIENTS
    // ==========================================
    {
      // ID: 7
      auth0_id: 'auth0|cl_1',
      email: 'm.scott@dundermifflin.com',
      first_name: 'Michael',
      last_name: 'Scott',
      role: 'client',
      is_verified: true,
      avatar_url:
        'https://res.cloudinary.com/dgsghju4q/image/upload/v1778155007/client1_avatar_ao4zqq.jpg',
    },
    {
      // ID: 8
      auth0_id: 'auth0|cl_2',
      email: 'p.beesly@example.com',
      first_name: 'Pam',
      last_name: 'Beesly',
      role: 'client',
      is_verified: true,
      avatar_url:
        'https://res.cloudinary.com/dgsghju4q/image/upload/v1778155014/client2_avatar_psssu9.jpg',
    },
    {
      // ID: 9
      auth0_id: 'auth0|cl_3',
      email: 'j.halpert@example.com',
      first_name: 'Jim',
      last_name: 'Halpert',
      role: 'client',
      is_verified: true,
      avatar_url: null,
    },
    {
      // ID: 10
      auth0_id: 'auth0|cl_4',
      email: 'dwight.s@schrutefarms.com',
      first_name: 'Dwight',
      last_name: 'Schrute',
      role: 'client',
      is_verified: false,
      avatar_url:
        'https://res.cloudinary.com/dgsghju4q/image/upload/v1778155018/client3_avatar_e508kr.jpg',
    },
    {
      // ID: 11
      auth0_id: 'auth0|cl_5',
      email: 'a.martin@example.com',
      first_name: 'Angela',
      last_name: 'Martin',
      role: 'client',
      is_verified: true,
      avatar_url:
        'https://res.cloudinary.com/dgsghju4q/image/upload/v1778155024/client4_avatar_jdjnmm.jpg',
    },
    {
      // ID: 12
      auth0_id: 'auth0|cl_6',
      email: 'k.malone@example.com',
      first_name: 'Kevin',
      last_name: 'Malone',
      role: 'client',
      is_verified: false,
      avatar_url: null,
    },
    {
      // ID: 13
      auth0_id: 'auth0|cl_7',
      email: 'stanley.h@example.com',
      first_name: 'Stanley',
      last_name: 'Hudson',
      role: 'client',
      is_verified: true,
      avatar_url:
        'https://res.cloudinary.com/dgsghju4q/image/upload/v1778155030/client5_avatar_cavgtn.jpg',
    },
    {
      // ID: 14
      auth0_id: 'auth0|cl_8',
      email: 'creed.b@example.com',
      first_name: 'Creed',
      last_name: 'Bratton',
      role: 'client',
      is_verified: false,
      avatar_url: null,
    },
    {
      // ID: 15
      auth0_id: 'auth0|cl_9',
      email: 'kelly.k@example.com',
      first_name: 'Kelly',
      last_name: 'Kapoor',
      role: 'client',
      is_verified: true,
      avatar_url:
        'https://res.cloudinary.com/dgsghju4q/image/upload/v1778155035/client6_avatar_xfc1zy.jpg',
    },
    {
      // ID: 16
      auth0_id: 'auth0|cl_10',
      email: 'ryan.h@example.com',
      first_name: 'Ryan',
      last_name: 'Howard',
      role: 'client',
      is_verified: true,
      avatar_url:
        'https://res.cloudinary.com/dgsghju4q/image/upload/v1778155042/client7_avatar_tdmo3l.jpg',
    },

    // ==========================================
    // DELETED / ANONYMIZED USERS
    // ==========================================
    {
      // ID: 17
      auth0_id: `deleted_17_${Date.now()}`,
      email: `deleted_17_${Date.now()}@deleted.engla.local`,
      first_name: 'Deleted',
      last_name: 'User',
      role: 'client',
      is_verified: false,
      avatar_url: null,
      deleted_at: knex.fn.now(),
    },
  ]);

  logger.info(
    '[Seed] Mock users created: 2 reserved, 2 staff, 2 extra hosts, 10 varied clients, 1 deleted',
  );
}
