import { describe, expect, it } from 'vitest';

import { generateTraceID, tryParseJSON } from '@utils/data.js';

describe('Data Utils', () => {
  describe('tryParseJSON', () => {
    it('should parse valid JSON string', () => {
      const input = '{"name": "John", "age": 30}';
      const result = tryParseJSON(input);

      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should parse valid JSON array', () => {
      const input = '[1, 2, 3, "test"]';
      const result = tryParseJSON(input);

      expect(result).toEqual([1, 2, 3, 'test']);
    });

    it('should return null for invalid JSON when no default provided', () => {
      const input = '{invalid json}';
      const result = tryParseJSON(input);

      expect(result).toBeNull();
    });

    it('should return default value for invalid JSON', () => {
      const input = '{invalid json}';
      const defaultValue = { fallback: true };
      const result = tryParseJSON(input, defaultValue);

      expect(result).toEqual(defaultValue);
    });

    it('should handle empty string', () => {
      const result = tryParseJSON('', { default: 'value' });
      expect(result).toEqual({ default: 'value' });
    });

    it('should parse JSON numbers', () => {
      const result = tryParseJSON('42');
      expect(result).toBe(42);
    });

    it('should parse JSON boolean', () => {
      expect(tryParseJSON('true')).toBe(true);
      expect(tryParseJSON('false')).toBe(false);
    });

    it('should parse JSON null', () => {
      const result = tryParseJSON('null');
      expect(result).toBeNull();
    });

    it('should return default value instead of throwing', () => {
      const fn = () => tryParseJSON('not json', { default: 'fallback' });
      expect(fn).not.toThrow();
      expect(fn()).toEqual({ default: 'fallback' });
    });
  });

  describe('generateTraceID', () => {
    it('should generate a trace ID', () => {
      const traceID = generateTraceID();
      expect(typeof traceID).toBe('string');
      expect(traceID.length).toBe(26); // ULID length
    });

    it('should generate unique trace IDs', () => {
      const traceID1 = generateTraceID();
      const traceID2 = generateTraceID();

      expect(traceID1).not.toBe(traceID2);
    });

    it('should generate valid ULID format', () => {
      const traceID = generateTraceID();
      // ULID regex pattern: 26 characters, alphanumeric
      const ulidRegex = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
      expect(ulidRegex.test(traceID)).toBe(true);
    });

    it('should generate different IDs on rapid calls', () => {
      const ids = Array.from({ length: 10 }, () => generateTraceID());
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(10);
    });
  });
});
