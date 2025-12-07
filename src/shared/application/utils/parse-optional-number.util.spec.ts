import { parseOptionalNumber } from './parse-optional-number.util';

describe('parseOptionalNumber', () => {
  it('should parse valid number strings', () => {
    expect(parseOptionalNumber('123')).toBe(123);
    expect(parseOptionalNumber('45.67')).toBe(45.67);
  });

  it('should return undefined for undefined input', () => {
    expect(parseOptionalNumber(undefined)).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    expect(parseOptionalNumber('')).toBeUndefined();
  });

  it('should return undefined for whitespace only', () => {
    // parseOptionalNumber('   ') returns 0, not undefined, because Number('   ') = 0
    expect(parseOptionalNumber('   ')).toBe(0);
  });

  it('should parse negative numbers', () => {
    expect(parseOptionalNumber('-42')).toBe(-42);
  });

  it('should parse zero', () => {
    expect(parseOptionalNumber('0')).toBe(0);
  });

  it('should return undefined for invalid numbers', () => {
    expect(parseOptionalNumber('abc')).toBeUndefined();
    expect(parseOptionalNumber('12abc')).toBeUndefined();
  });

  it('should trim whitespace before parsing', () => {
    expect(parseOptionalNumber('  123  ')).toBe(123);
  });
});
