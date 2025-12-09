import {
  normalizeDateStart,
  normalizeDateEnd,
} from './normalize-date-boundaries.util';

describe('normalizeDateStart', () => {
  it('should set time to start of day', () => {
    const date = new Date('2025-12-07T15:30:45');
    const result = normalizeDateStart(date);

    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('should preserve the date', () => {
    const date = new Date('2025-12-07T15:30:45');
    const result = normalizeDateStart(date);

    expect(result.getDate()).toBe(7);
    expect(result.getMonth()).toBe(11); // December = 11
    expect(result.getFullYear()).toBe(2025);
  });

  it('should handle already normalized date', () => {
    const date = new Date('2025-12-07T00:00:00');
    const result = normalizeDateStart(date);

    expect(result.getTime()).toBe(date.getTime());
  });
});

describe('normalizeDateEnd', () => {
  it('should set time to end of day', () => {
    const date = new Date('2025-12-07T10:30:45');
    const result = normalizeDateEnd(date);

    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
    expect(result.getMilliseconds()).toBe(999);
  });

  it('should preserve the date', () => {
    const date = new Date('2025-12-07T10:30:45');
    const result = normalizeDateEnd(date);

    expect(result.getDate()).toBe(7);
    expect(result.getMonth()).toBe(11);
    expect(result.getFullYear()).toBe(2025);
  });

  it('should handle dates close to midnight', () => {
    const date = new Date('2025-12-07T23:59:59');
    const result = normalizeDateEnd(date);

    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
  });
});
