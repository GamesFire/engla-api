import { type Bind, decorate, injectable } from 'inversify';

import { logger } from '@lib/logger.js';

import { ReflectKey } from './constants.js';
import type { ProvideMetadata } from './types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

/**
 * Decorator to automatically register a class in the IOC container.
 * It marks the class as `@injectable` and defines binding metadata (Singleton by default).
 *
 * @example
 * Usage:
 *
 * ```ts
 * @provide()
 * export class AuthService {
 *   // ...
 * }
 * ```
 */
export function provide() {
  return function <T extends Constructor>(target: T): T {
    const isAlreadyDecorated = Reflect.hasOwnMetadata('inversify:paramtypes', target);

    if (!isAlreadyDecorated) {
      try {
        decorate(injectable(), target);
      } catch (err) {
        logger.warn(`[IOC] Failed to decorate class ${target.name}`, { error: err });
      }
    }

    const currentMetadata: ProvideMetadata = {
      constraint: (bind: Bind) => bind(target).toSelf().inSingletonScope(),
      implementationType: target,
    };

    const previousMetadata: ProvideMetadata[] =
      Reflect.getMetadata(ReflectKey.PROVIDE, Reflect) || [];
    const newMetadata = [currentMetadata, ...previousMetadata];

    Reflect.defineMetadata(ReflectKey.PROVIDE, newMetadata, Reflect);

    return target;
  };
}
