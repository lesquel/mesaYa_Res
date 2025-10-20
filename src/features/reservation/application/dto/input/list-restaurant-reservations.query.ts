import { ListReservationsQuery } from './list-reservations.query';

export interface ListRestaurantReservationsQuery extends ListReservationsQuery {
  restaurantId: string;
}
