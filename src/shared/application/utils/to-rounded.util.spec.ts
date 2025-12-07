import { toRounded } from './to-rounded.util';

describe('toRounded', () => {
  it('should round to 2 decimal places', () => {
    expect(toRounded(3.14159)).toBe(3.14);
    expect(toRounded(2.678)).toBe(2.68);
  });

  it('should handle integers', () => {
    expect(toRounded(5)).toBe(5);
    expect(toRounded(100)).toBe(100);
  });

  it('should handle negative numbers', () => {
    expect(toRounded(-3.456)).toBe(-3.46);
    expect(toRounded(-10.1)).toBe(-10.1);
  });

  it('should handle zero', () => {
    expect(toRounded(0)).toBe(0);
  });

  it('should handle very small numbers', () => {
    expect(toRounded(0.001)).toBe(0);
    expect(toRounded(0.005)).toBe(0.01);
  });

  it('should round up correctly', () => {
    expect(toRounded(1.995)).toBe(2);
    // 1.555 rounds to 1.55 due to floating point precision
    expect(toRounded(1.555)).toBe(1.55);
  });
});
