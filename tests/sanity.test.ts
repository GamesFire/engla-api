import { describe, expect, it } from 'vitest';

describe('Environment Sanity Check', () => {
  it('should be true', () => {
    expect(true).toBe(true);
  });

  it('should run tests successfully', () => {
    expect(1 + 1).toBe(2);
  });
});
