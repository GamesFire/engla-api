import cron from 'node-cron';

import { constructIOC } from '@ioc/container.js';
import { appConfig } from '@lib/configs/app.config.js';
import { logger } from '@lib/logger.js';
import { BookingService } from '@modules/bookings/booking.service.js';

export class BookingLifecycleJob {
  public static schedule(): void {
    const ioc = global.ioc || constructIOC();
    const bookingService = ioc.get(BookingService);

    const { CRON_BOOKING_SCHEDULE } = appConfig;

    cron.schedule(CRON_BOOKING_SCHEDULE, async () => {
      logger.info('[BookingLifecycleJob] Starting scheduled booking lifecycle maintenance...');

      try {
        await bookingService.expireOverduePendingBookings();
        await bookingService.completeFinishedBookings();

        logger.info(
          '[BookingLifecycleJob] Scheduled booking lifecycle maintenance finished successfully.',
        );
      } catch (error) {
        logger.error(
          '[BookingLifecycleJob] Error during scheduled booking lifecycle maintenance:',
          error,
        );
      }
    });

    logger.info(`[BookingLifecycleJob] Scheduled to run with pattern: ${CRON_BOOKING_SCHEDULE}`);
  }
}
