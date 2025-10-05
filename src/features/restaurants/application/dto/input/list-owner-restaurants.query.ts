import { ListRestaurantsQuery } from './list-restaurants.query.js';

export interface ListOwnerRestaurantsQuery extends ListRestaurantsQuery {
  ownerId: string;
}
