import { InvalidRestaurantDataError } from '../../errors/invalid-restaurant-data.error.js';

export const RESTAURANT_DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export type RestaurantDay = (typeof RESTAURANT_DAYS)[number];

export function assertRestaurantDay(value: string): asserts value is RestaurantDay {
  if (!RESTAURANT_DAYS.includes(value as RestaurantDay)) {
    throw new InvalidRestaurantDataError('Invalid day provided in daysOpen');
  }
}
