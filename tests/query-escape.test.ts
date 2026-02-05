import { describe, it, expect } from 'vitest';
import { escapeSearchQuery } from '../src/shared/utils/query-escape.js';

describe('escapeSearchQuery (shared utility)', () => {
  it('should escape double quotes', () => {
    expect(escapeSearchQuery('test "value"')).toBe('test \\"value\\"');
  });

  it('should escape backslashes', () => {
    expect(escapeSearchQuery('path\\to\\file')).toBe('path\\\\to\\\\file');
  });

  it('should escape square brackets', () => {
    expect(escapeSearchQuery('array[0]')).toBe('array\\[0\\]');
  });

  it('should handle empty string', () => {
    expect(escapeSearchQuery('')).toBe('');
  });

  it('should handle null/undefined safely', () => {
    expect(escapeSearchQuery(null as unknown as string)).toBe('');
    expect(escapeSearchQuery(undefined as unknown as string)).toBe('');
  });

  it('should preserve normal characters', () => {
    expect(escapeSearchQuery('normal query 123')).toBe('normal query 123');
  });

  it('should handle complex mixed input', () => {
    const input = 'Error: "Connection [timeout]" at path\\file.ts';
    const expected = 'Error: \\"Connection \\[timeout\\]\\" at path\\\\file.ts';
    expect(escapeSearchQuery(input)).toBe(expected);
  });
});
