import { toNumber } from './to-number.util';

describe('toNumber', () => {
  it('should convert string to number', () => {
    expect(toNumber('123')).toBe(123);
    expect(toNumber('45.67')).toBe(45.67);
  });

  it('should return number as is', () => {
    expect(toNumber(100)).toBe(100);
    expect(toNumber(0)).toBe(0);
    expect(toNumber(-50)).toBe(-50);
  });

  it('should return 0 for null or undefined', () => {
    expect(toNumber(null)).toBe(0);
    expect(toNumber(undefined)).toBe(0);
  });

  it('should handle negative numbers', () => {
    expect(toNumber('-42')).toBe(-42);
  });

  it('should handle decimal numbers', () => {
    expect(toNumber('3.14159')).toBe(3.14159);
  });

  it('should return 0 for invalid strings', () => {
    // toNumber returns 0 for NaN values, not NaN itself
    expect(toNumber('abc')).toBe(0);
  });
});
