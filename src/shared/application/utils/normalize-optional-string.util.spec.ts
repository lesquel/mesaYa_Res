import { normalizeOptionalString } from './normalize-optional-string.util';

describe('normalizeOptionalString', () => {
  it('should normalize valid strings', () => {
    expect(normalizeOptionalString('Hello')).toBe('Hello');
    expect(normalizeOptionalString('test')).toBe('test');
  });

  it('should return undefined for undefined input', () => {
    expect(normalizeOptionalString(undefined)).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    expect(normalizeOptionalString('')).toBeUndefined();
  });

  it('should return undefined for whitespace only', () => {
    expect(normalizeOptionalString('   ')).toBeUndefined();
  });

  it('should trim whitespace', () => {
    expect(normalizeOptionalString('  hello  ')).toBe('hello');
    expect(normalizeOptionalString('\n\t test \n')).toBe('test');
  });

  it('should preserve internal whitespace', () => {
    expect(normalizeOptionalString('hello world')).toBe('hello world');
  });

  it('should handle special characters', () => {
    expect(normalizeOptionalString('hello@world')).toBe('hello@world');
    expect(normalizeOptionalString('test-123')).toBe('test-123');
  });
});
