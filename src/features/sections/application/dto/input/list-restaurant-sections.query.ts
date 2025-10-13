import { ListSectionsQuery } from './list-sections.query.js';

export interface ListRestaurantSectionsQuery extends ListSectionsQuery {
  restaurantId: string;
}
