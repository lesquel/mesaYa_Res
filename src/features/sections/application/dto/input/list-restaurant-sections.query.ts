import { ListSectionsQuery } from './list-sections.query';

export interface ListRestaurantSectionsQuery extends ListSectionsQuery {
  restaurantId: string;
}
