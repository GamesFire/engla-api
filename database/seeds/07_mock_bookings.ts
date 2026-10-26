import dayjs from 'dayjs';
import type { Knex } from 'knex';

import { appConfig } from '@lib/configs/app.config.js';
import { logger } from '@lib/logger.js';

export async function seed(knex: Knex): Promise<void> {
  if (appConfig.isProd) {
    logger.info('[Seed] Skipping mock bookings in production environment');
    return;
  }

  await knex.raw('TRUNCATE TABLE bookings RESTART IDENTITY CASCADE');
  await knex.raw('TRUNCATE TABLE property_blocked_dates RESTART IDENTITY CASCADE');

  const today = dayjs().startOf('day');

  // --- Bookings ---
  await knex('bookings').insert([
    {
      // 1. COMPLETED stay in London Penthouse (Property 1, Host 2, Guest 7 - Michael Scott)
      property_id: 1,
      guest_id: 7,
      host_id: 2,
      status: 'completed',
      payment_status: 'paid',
      check_in_date: today.subtract(20, 'day').format('YYYY-MM-DD'),
      check_out_date: today.subtract(16, 'day').format('YYYY-MM-DD'),
      nights: 4,
      guests_count: 2,
      price_per_night: 25000,
      cleaning_fee: 5000,
      nights_subtotal: 100000,
      total_price: 105000,
      platform_fee: 10500,
      host_payout: 94500,
      currency: 'GBP',
      cancellation_policy: 'strict',
      special_requests: 'Could we have extra pillows and a late check-in around 18:00?',
      stripe_checkout_session_id: 'cs_test_mock_completed_1',
      stripe_payment_intent_id: 'pi_test_mock_completed_1',
      paid_at: today.subtract(30, 'day').toDate(),
      completed_at: today.subtract(16, 'day').toDate(),
    },
    {
      // 2. COMPLETED stay in Cotswolds Cottage (Property 8, Host 5, Guest 8 - Pam Beesly)
      property_id: 8,
      guest_id: 8,
      host_id: 5,
      status: 'completed',
      payment_status: 'paid',
      check_in_date: today.subtract(14, 'day').format('YYYY-MM-DD'),
      check_out_date: today.subtract(11, 'day').format('YYYY-MM-DD'),
      nights: 3,
      guests_count: 4,
      price_per_night: 18000,
      cleaning_fee: 4000,
      nights_subtotal: 54000,
      total_price: 58000,
      platform_fee: 5800,
      host_payout: 52200,
      currency: 'GBP',
      cancellation_policy: 'moderate',
      special_requests: 'Bringing a small golden retriever!',
      stripe_checkout_session_id: 'cs_test_mock_completed_2',
      stripe_payment_intent_id: 'pi_test_mock_completed_2',
      paid_at: today.subtract(25, 'day').toDate(),
      completed_at: today.subtract(11, 'day').toDate(),
    },
    {
      // 3. CONFIRMED upcoming stay in London Penthouse (Property 1, Host 2, Guest 9 - Jim Halpert)
      property_id: 1,
      guest_id: 9,
      host_id: 2,
      status: 'confirmed',
      payment_status: 'paid',
      check_in_date: today.add(10, 'day').format('YYYY-MM-DD'),
      check_out_date: today.add(15, 'day').format('YYYY-MM-DD'),
      nights: 5,
      guests_count: 2,
      price_per_night: 25000,
      cleaning_fee: 5000,
      nights_subtotal: 125000,
      total_price: 130000,
      platform_fee: 13000,
      host_payout: 117000,
      currency: 'GBP',
      cancellation_policy: 'strict',
      special_requests: 'Celebrating our anniversary!',
      stripe_checkout_session_id: 'cs_test_mock_confirmed_3',
      stripe_payment_intent_id: 'pi_test_mock_confirmed_3',
      paid_at: today.subtract(2, 'day').toDate(),
    },
    {
      // 4. CONFIRMED upcoming stay in Shoreditch Loft (Property 2, Host 2, Guest 7 - Michael Scott)
      property_id: 2,
      guest_id: 7,
      host_id: 2,
      status: 'confirmed',
      payment_status: 'paid',
      check_in_date: today.add(20, 'day').format('YYYY-MM-DD'),
      check_out_date: today.add(23, 'day').format('YYYY-MM-DD'),
      nights: 3,
      guests_count: 2,
      price_per_night: 18000,
      cleaning_fee: 4000,
      nights_subtotal: 54000,
      total_price: 58000,
      platform_fee: 5800,
      host_payout: 52200,
      currency: 'GBP',
      cancellation_policy: 'moderate',
      stripe_checkout_session_id: 'cs_test_mock_confirmed_4',
      stripe_payment_intent_id: 'pi_test_mock_confirmed_4',
      paid_at: today.subtract(1, 'day').toDate(),
    },
    {
      // 5. CANCELLED booking in Chelsea Townhouse (Property 3, Host 2, Guest 11 - Angela Martin)
      property_id: 3,
      guest_id: 11,
      host_id: 2,
      status: 'cancelled',
      payment_status: 'refunded',
      check_in_date: today.add(30, 'day').format('YYYY-MM-DD'),
      check_out_date: today.add(34, 'day').format('YYYY-MM-DD'),
      nights: 4,
      guests_count: 4,
      price_per_night: 45000,
      cleaning_fee: 10000,
      nights_subtotal: 180000,
      total_price: 190000,
      platform_fee: 19000,
      host_payout: 171000,
      currency: 'GBP',
      cancellation_policy: 'strict',
      stripe_checkout_session_id: 'cs_test_mock_cancelled_5',
      stripe_payment_intent_id: 'pi_test_mock_cancelled_5',
      stripe_refund_id: 're_test_mock_cancelled_5',
      refunded_amount: 190000,
      paid_at: today.subtract(5, 'day').toDate(),
      cancelled_at: today.subtract(3, 'day').toDate(),
      cancelled_by_role: 'client',
      cancellation_reason: 'Flight schedule changed unexpectedly.',
    },
  ]);

  // --- Property Blocked Dates ---
  await knex('property_blocked_dates').insert([
    {
      property_id: 1,
      start_date: today.add(25, 'day').format('YYYY-MM-DD'),
      end_date: today.add(28, 'day').format('YYYY-MM-DD'),
      reason: 'Scheduled balcony maintenance',
    },
    {
      property_id: 8,
      start_date: today.add(5, 'day').format('YYYY-MM-DD'),
      end_date: today.add(9, 'day').format('YYYY-MM-DD'),
      reason: 'Family visiting for the weekend',
    },
  ]);

  logger.info('[Seed] Mock bookings (5) and property blocked dates (2) created');
}
