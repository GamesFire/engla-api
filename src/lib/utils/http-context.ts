import { AsyncLocalStorage } from 'async_hooks';
import type { Logger } from 'winston';

import type { HttpContextStore } from '@app/interfaces/http-context-store.interface.js';

const storage = new AsyncLocalStorage<HttpContextStore>();

export const HttpContext = {
  /**
   * Runs code within the context.
   * All asynchronous operations inside the callback will have access to the store.
   */
  run: (store: HttpContextStore, callback: () => void) => {
    storage.run(store, callback);
  },

  /**
   * Gets the current store.
   * Returns undefined if called outside of an HTTP request.
   */
  getStore: (): Undefinable<HttpContextStore> => {
    return storage.getStore();
  },

  /**
   * Gets the logger for the current request.
   * If there is no context (e.g., app startup), returns a default logger (or undefined, depending on logic).
   */
  getLogger: (): Undefinable<Logger> => {
    return storage.getStore()?.logger;
  },

  /**
   * Gets the Trace ID of the current request.
   */
  getTraceID: (): Undefinable<string> => {
    return storage.getStore()?.traceID;
  },
};
