import { BadRequestException } from '@nestjs/common';

/**
 * Parses a date string with validation and optional time normalization.
 * @param value - The ISO date string to parse
 * @param endOfDay - If true, sets time to 23:59:59.999; if false, sets to 00:00:00.000
 * @param field - The field name for error messages
 * @returns The parsed Date object
 * @throws BadRequestException if the date is invalid
 */
export function parseAnalyticsDate(
  value: string,
  endOfDay: boolean,
  field: 'startDate' | 'endDate' | string,
): Date {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`${field} debe ser una fecha ISO válida.`);
  }

  if (endOfDay) {
    parsed.setHours(23, 59, 59, 999);
  } else {
    parsed.setHours(0, 0, 0, 0);
  }

  return parsed;
}
