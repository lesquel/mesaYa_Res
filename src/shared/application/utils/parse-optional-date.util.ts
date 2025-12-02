/**
 * Parses a date string, returning undefined if invalid.
 * Optionally sets the time to start or end of day for date-only strings.
 *
 * @param value - The date string to parse
 * @param endOfDay - If true and no time is specified, set time to 23:59:59.999
 * @returns The parsed Date, or undefined if invalid
 *
 * @example
 * parseOptionalDate('2024-01-15') // Date at 00:00:00.000
 * parseOptionalDate('2024-01-15', true) // Date at 23:59:59.999
 * parseOptionalDate('2024-01-15T10:30:00') // Date at 10:30:00.000
 * parseOptionalDate('invalid') // undefined
 */
export function parseOptionalDate(
  value: string | undefined,
  endOfDay = false,
): Date | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim();
  if (!normalized) {
    return undefined;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  if (!normalized.includes('T')) {
    if (endOfDay) {
      parsed.setHours(23, 59, 59, 999);
    } else {
      parsed.setHours(0, 0, 0, 0);
    }
  }

  return parsed;
}
