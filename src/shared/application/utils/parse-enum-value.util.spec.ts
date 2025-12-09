import { parseEnumValue } from './parse-enum-value.util';

enum TestStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

describe('parseEnumValue', () => {
  it('should parse lowercase values to enum', () => {
    expect(parseEnumValue('active', TestStatus)).toBe('ACTIVE');
    expect(parseEnumValue('inactive', TestStatus)).toBe('INACTIVE');
  });

  it('should parse uppercase values to enum', () => {
    expect(parseEnumValue('ACTIVE', TestStatus)).toBe('ACTIVE');
    expect(parseEnumValue('PENDING', TestStatus)).toBe('PENDING');
  });

  it('should return undefined for undefined input', () => {
    expect(parseEnumValue(undefined, TestStatus)).toBeUndefined();
  });

  it('should return undefined for invalid values', () => {
    expect(parseEnumValue('invalid', TestStatus)).toBeUndefined();
    expect(parseEnumValue('unknown', TestStatus)).toBeUndefined();
  });

  it('should trim whitespace', () => {
    expect(parseEnumValue('  active  ', TestStatus)).toBe('ACTIVE');
  });

  it('should handle mixed case', () => {
    expect(parseEnumValue('AcTiVe', TestStatus)).toBe('ACTIVE');
  });

  it('should return undefined for empty string', () => {
    expect(parseEnumValue('', TestStatus)).toBeUndefined();
  });
});
