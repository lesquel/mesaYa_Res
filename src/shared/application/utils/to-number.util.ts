/**
 * Converts a value that may be a string, number, null, or undefined to a number.
 * Returns 0 if the value is null, undefined, or cannot be parsed.
 *
 * @param value - The value to convert
 * @returns The converted number or 0 if conversion fails
 */
export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? 0 : value;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}
