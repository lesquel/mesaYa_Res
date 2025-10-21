import { ListRestaurantsQuery } from './list-restaurants.query';

export interface ListOwnerRestaurantsQuery extends ListRestaurantsQuery {
  ownerId: string;
}
