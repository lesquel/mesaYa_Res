import { InvalidRestaurantDataError } from '../../errors/invalid-restaurant-data.error';
import { assertRestaurantDay, type RestaurantDay } from './restaurant-day';

export class RestaurantDaysOpen {
  private readonly internal: RestaurantDay[];

  constructor(days: readonly RestaurantDay[] = []) {
    if (!Array.isArray(days)) {
      throw new InvalidRestaurantDataError('Days open must be an array');
    }

    this.internal = days.map((day) => {
      assertRestaurantDay(day);
      return day;
    });
  }

  get value(): RestaurantDay[] {
    return [...this.internal];
  }
}
