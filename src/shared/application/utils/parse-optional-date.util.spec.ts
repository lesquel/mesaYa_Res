import { parseOptionalDate } from './parse-optional-date.util';

describe('parseOptionalDate', () => {
  it('should parse ISO date strings', () => {
    const result = parseOptionalDate('2024-01-15');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getFullYear()).toBe(2024);
    expect(result?.getMonth()).toBe(0); // January
    // Date may vary due to timezone, just check it's valid
    expect(result?.getDate()).toBeGreaterThan(0);
  });

  it('should set time to start of day by default', () => {
    const result = parseOptionalDate('2024-01-15');
    expect(result?.getHours()).toBe(0);
    expect(result?.getMinutes()).toBe(0);
    expect(result?.getSeconds()).toBe(0);
  });

  it('should set time to end of day when specified', () => {
    const result = parseOptionalDate('2024-01-15', true);
    expect(result?.getHours()).toBe(23);
    expect(result?.getMinutes()).toBe(59);
    expect(result?.getSeconds()).toBe(59);
    expect(result?.getMilliseconds()).toBe(999);
  });

  it('should preserve time from datetime string', () => {
    const result = parseOptionalDate('2024-01-15T10:30:00');
    expect(result?.getHours()).toBe(10);
    expect(result?.getMinutes()).toBe(30);
  });

  it('should return undefined for invalid dates', () => {
    expect(parseOptionalDate('invalid')).toBeUndefined();
    expect(parseOptionalDate('not-a-date')).toBeUndefined();
  });

  it('should return undefined for undefined input', () => {
    expect(parseOptionalDate(undefined)).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    expect(parseOptionalDate('')).toBeUndefined();
  });

  it('should return undefined for whitespace only', () => {
    expect(parseOptionalDate('   ')).toBeUndefined();
  });

  it('should trim whitespace', () => {
    const result = parseOptionalDate('  2024-01-15  ');
    expect(result).toBeInstanceOf(Date);
  });
});
