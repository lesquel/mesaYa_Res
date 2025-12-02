/**
 * Parses a string to a number, returning undefined if invalid.
 *
 * @param value - The string value to parse
 * @returns The parsed number, or undefined if not a finite number
 *
 * @example
 * parseOptionalNumber('42') // 42
 * parseOptionalNumber('3.14') // 3.14
 * parseOptionalNumber('invalid') // undefined
 * parseOptionalNumber(undefined) // undefined
 */
export function parseOptionalNumber(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}
