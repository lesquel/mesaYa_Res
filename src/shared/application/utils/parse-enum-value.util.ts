/**
 * Parses a string value to an enum value, returning undefined if not valid.
 *
 * @param value - The string value to parse
 * @param enumObject - The enum object to validate against
 * @returns The enum value if valid, or undefined
 *
 * @example
 * enum Status { ACTIVE = 'ACTIVE', INACTIVE = 'INACTIVE' }
 * parseEnumValue('active', Status) // 'ACTIVE'
 * parseEnumValue('ACTIVE', Status) // 'ACTIVE'
 * parseEnumValue('invalid', Status) // undefined
 */
export function parseEnumValue<T extends Record<string, string>>(
  value: string | undefined,
  enumObject: T,
): T[keyof T] | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();
  const enumValues = Object.values(enumObject);

  return enumValues.includes(normalized)
    ? (normalized as T[keyof T])
    : undefined;
}
