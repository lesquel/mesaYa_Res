/**
 * Trims a string and returns undefined if empty.
 *
 * @param value - The string value to normalize
 * @returns The trimmed string, or undefined if empty/undefined
 *
 * @example
 * normalizeOptionalString('  hello  ') // 'hello'
 * normalizeOptionalString('') // undefined
 * normalizeOptionalString('   ') // undefined
 * normalizeOptionalString(undefined) // undefined
 */
export function normalizeOptionalString(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
