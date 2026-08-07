/* eslint-disable no-console */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs/promises';
import path from 'path';
import { ulid } from 'ulid';

import type { PackageJson } from '@app/interfaces/package-json.interface.js';

/**
 * Safely parse a JSON string.
 *
 * @template T - The type of the parsed JSON object.
 * @param input - The JSON string to parse.
 * @param [defaults] - The default value to return if parsing fails.
 * @returns The parsed JSON object, or the default value if parsing fails.
 */
export function tryParseJSON<T = any>(input: string, defaults: Nullable<T> = null): Nullable<T> {
  try {
    return JSON.parse(input) as T;
  } catch {
    return defaults;
  }
}

/**
 * Safely converts an unknown request body or payload into a Node.js Buffer.
 *
 * @param payload - The input data (Buffer, string, or JSON object).
 * @returns A guaranteed Node.js Buffer.
 */
export function toBuffer(payload: unknown): Buffer {
  if (payload instanceof Buffer) {
    return payload;
  }

  if (typeof payload === 'string') {
    return Buffer.from(payload, 'utf-8');
  }

  return Buffer.from(JSON.stringify(payload), 'utf-8');
}

/**
 * Reads package.json from the project root (process.cwd()).
 *
 * @returns A promise that resolves to a typed object or a fallback value.
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
 *
 * @returns The generated trace ID.
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
 * @param obj - The source object.
 * @returns A new object with `undefined` properties removed.
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
