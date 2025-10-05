import { ListReviewsQuery } from './list-reviews.query.js';

export interface ListRestaurantReviewsQuery extends ListReviewsQuery {
  restaurantId: string;
}
