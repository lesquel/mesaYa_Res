/**
 * Rounds a number to 2 decimal places safely.
 * Returns 0 if the value is not a finite number.
 *
 * @param value - The number to round
 * @returns The rounded number, or 0 if not finite
 *
 * @example
 * toRounded(3.14159) // 3.14
 * toRounded(Infinity) // 0
 * toRounded(NaN) // 0
 */
export function toRounded(value: number): number {
  return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
}
