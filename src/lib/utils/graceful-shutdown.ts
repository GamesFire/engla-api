import { logger } from '../logger.js';

/**
 * Handles the graceful shutdown of the application.
 * Ensures that all resources (DB connections, HTTP servers, Redis, etc.)
 * are closed properly before the process exits.
 */
export class GracefulShutdownHandler {
  /**
   * Registry of cleanup tasks to be executed during shutdown.
   */
  private static shutdownTasks: Array<(signal: string, err?: Error) => Promise<void>> = [];

  /**
   * Flag to prevent multiple shutdown sequences from running simultaneously.
   */
  private static isShuttingDown = false;

  /**
   * Registers a cleanup task to be executed during graceful shutdown.
   *
   * @param task - An async function that handles resource cleanup.
   * It receives the signal and an optional error object.
   * @example
   * GracefulShutdownHandler.registerTask(async () => {
   * await db.destroy();
   * logger.info('DB closed');
   * });
   */
  public static registerTask(task: (signal: string, err?: Error) => Promise<void>): void {
    GracefulShutdownHandler.shutdownTasks.push(task);
  }

  /**
   * Orchestrates the shutdown process.
   * Executes all registered tasks in parallel and exits the process.
   *
   * @param signal - The signal that triggered the shutdown (e.g., 'SIGTERM', 'SIGINT').
   * @param err - Optional error object if triggered by an uncaught exception.
   */
  private static async handleShutdown(signal: string, err?: Error): Promise<void> {
    if (GracefulShutdownHandler.isShuttingDown) {
      return;
    }

    GracefulShutdownHandler.isShuttingDown = true;
    logger.info(
      `[GracefulShutdown] Received signal: ${signal}. Processing ${GracefulShutdownHandler.shutdownTasks.length} tasks...`,
    );

    try {
      await Promise.all(GracefulShutdownHandler.shutdownTasks.map((task) => task(signal, err)));
      logger.info('[GracefulShutdown] All tasks completed. Exiting.');
    } catch (error) {
      logger.error('Error during shutdown tasks:', error);
    } finally {
      process.exit(err ? 1 : 0);
    }
  }

  /**
   * Initializes system signal listeners.
   * Listens for SIGINT, SIGTERM, SIGQUIT, uncaughtException, and unhandledRejection.
   */
  public static setup(): void {
    const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

    signals.forEach((signal) => {
      process.on(signal, () => GracefulShutdownHandler.handleShutdown(signal));
    });

    process.on('uncaughtException', async (err) => {
      logger.error('Uncaught Exception:', err);
      await GracefulShutdownHandler.handleShutdown('uncaughtException', err);
    });

    process.on('unhandledRejection', async (reason) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      logger.error('Unhandled Rejection:', error);
      await GracefulShutdownHandler.handleShutdown('unhandledRejection', error);
    });
  }
}
