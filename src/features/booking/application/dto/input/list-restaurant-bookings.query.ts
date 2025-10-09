import { ListBookingsQuery } from './list-bookings.query.js';

export interface ListRestaurantBookingsQuery extends ListBookingsQuery {
  restaurantId: string;
}
