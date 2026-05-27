/**
 * Keys for the Reflect API used by decorators.
 * Use prefixes (ioc:...) to avoid conflicts with other libraries.
 */
export const ReflectKey = {
  PROVIDE: Symbol.for('ioc:provide_metadata'),
} as const;

/**
 * Dependency Injection Symbols.
 * Use them when injecting third-party libraries or interfaces.
 */
export const InjectionToken = {
  // Infrastructure Clients
  RedisClient: Symbol.for('Infra:RedisClient'),
  KnexClient: Symbol.for('Infra:KnexClient'),
} as const;
