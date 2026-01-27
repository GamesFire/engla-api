/**
 * Keys for the Reflect API used by decorators.
 * Use prefixes (ioc:...) to avoid conflicts with other libraries.
 */
export const REFLECT_KEYS = {
  PROVIDE: Symbol.for('ioc:provide_metadata'),
};

/**
 * Dependency Injection Symbols.
 * Use them when injecting third-party libraries or interfaces.
 */
export const DI = {
  // Infrastructure Clients
  RedisClient: Symbol.for('Infra:RedisClient'),
  KnexClient: Symbol.for('Infra:KnexClient'),
};
