import { ListReservationsQuery } from './list-bookings.query.js';

export interface ListRestaurantReservationsQuery extends ListReservationsQuery {
  restaurantId: string;
}
