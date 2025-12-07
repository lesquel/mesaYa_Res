import { BadRequestException } from '@nestjs/common';
import { parseAnalyticsDate } from './parse-analytics-date.util';

describe('parseAnalyticsDate', () => {
  it('should parse valid ISO date strings', () => {
    const result = parseAnalyticsDate('2024-01-15', false, 'startDate');
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
  });

  it('should set time to start of day when endOfDay is false', () => {
    const result = parseAnalyticsDate('2024-01-15', false, 'startDate');
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('should set time to end of day when endOfDay is true', () => {
    const result = parseAnalyticsDate('2024-01-15', true, 'endDate');
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });

  it('should throw BadRequestException for invalid dates', () => {
    expect(() => {
      parseAnalyticsDate('invalid', false, 'startDate');
    }).toThrow(BadRequestException);
  });

  it('should include field name in error message', () => {
    expect(() => {
      parseAnalyticsDate('invalid', false, 'startDate');
    }).toThrow('startDate debe ser una fecha ISO válida.');
  });

  it('should handle different field names', () => {
    expect(() => {
      parseAnalyticsDate('invalid', false, 'endDate');
    }).toThrow('endDate debe ser una fecha ISO válida.');
  });

  it('should parse datetime strings', () => {
    const result = parseAnalyticsDate('2024-01-15T10:30:00', false, 'date');
    expect(result).toBeInstanceOf(Date);
    expect(result.getHours()).toBe(0); // Normalized to start of day
  });
});
