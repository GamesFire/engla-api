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
