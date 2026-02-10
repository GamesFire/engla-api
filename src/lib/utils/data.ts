/* eslint-disable no-console */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs/promises';
import path from 'path';
import { ulid } from 'ulid';

import type { PackageJson } from '@app/interfaces/package-json.interface.js';

/**
 * Safely parse a JSON string.
 * Returns null or the default value if parsing fails, instead of throwing an error.
 */
export function tryParseJSON<T = any>(input: string, defaults: Nullable<T> = null): Nullable<T> {
  try {
    return JSON.parse(input) as T;
  } catch {
    return defaults;
  }
}

/**
 * Reads package.json from the project root (process.cwd()).
 * Returns a typed object or a fallback value.
 */
export async function getPackageInfo(): Promise<PackageJson> {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const content = await fs.readFile(packagePath, 'utf-8');

    const data = tryParseJSON<PackageJson>(content);

    if (!data) {
      throw new Error('Invalid JSON in package.json');
    }

    return data;
  } catch (error) {
    console.warn('Could not read package.json, using fallback version 0.0.0');

    return {
      name: 'engla-api-fallback',
      version: '0.0.0',
      description: 'Fallback description (could not read package.json)',
    };
  }
}

/**
 * Generate a unique trace ID using ulid.
 */
export function generateTraceID(): string {
  return ulid();
}

/**
 * Creates a shallow copy of the object excluding keys with `undefined` values.
 * Useful for PATCH operations where `undefined` means "do not update",
 * while `null` means "set to null".
 *
 * @template T - The type of the input object.
 * @param {T} obj - The source object.
 * @returns {T} A new object with `undefined` properties removed.
 *
 * @example
 * const input = { name: 'John', age: undefined, bio: null };
 * const result = skipUndefinedFields(input);
 * // result is { name: 'John', bio: null }
 */
export function skipUndefinedFields<T extends object>(obj: T): T {
  const result = {} as T;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (value !== undefined) {
        result[key] = value;
      }
    }
  }

  return result;
}
