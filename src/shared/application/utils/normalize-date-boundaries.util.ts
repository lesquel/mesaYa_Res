/**
 * Normalizes a date to the start of the day (00:00:00.000).
 *
 * @param date - The date to normalize
 * @returns A new Date set to the start of the day
 *
 * @example
 * normalizeDateStart(new Date('2024-01-15T14:30:00')) // 2024-01-15T00:00:00.000
 */
export function normalizeDateStart(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Normalizes a date to the end of the day (23:59:59.999).
 *
 * @param date - The date to normalize
 * @returns A new Date set to the end of the day
 *
 * @example
 * normalizeDateEnd(new Date('2024-01-15T14:30:00')) // 2024-01-15T23:59:59.999
 */
export function normalizeDateEnd(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized;
}
