import { ListReservationsQuery } from './list-reservations.query.js';

export interface ListRestaurantReservationsQuery extends ListReservationsQuery {
  restaurantId: string;
}
