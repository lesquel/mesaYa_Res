import { ListReservationsQuery } from './list-reservations.query';

export interface ListOwnerReservationsQuery extends ListReservationsQuery {
  ownerId: string;
  restaurantId?: string;
}
