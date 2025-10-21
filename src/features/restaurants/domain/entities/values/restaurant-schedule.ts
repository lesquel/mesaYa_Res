import { InvalidRestaurantDataError } from '../../errors/invalid-restaurant-data.error';

const TIME_REGEX = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

export class RestaurantSchedule {
  private readonly open: string;
  private readonly close: string;

  constructor(openTime: string, closeTime: string) {
    RestaurantSchedule.assertTime(openTime, 'Open time');
    RestaurantSchedule.assertTime(closeTime, 'Close time');

    this.open = openTime;
    this.close = closeTime;
  }

  get openTime(): string {
    return this.open;
  }

  get closeTime(): string {
    return this.close;
  }

  private static assertTime(value: string, label: string): void {
    if (!TIME_REGEX.test(value)) {
      throw new InvalidRestaurantDataError(`${label} must be in HH:mm format`);
    }
  }
}
