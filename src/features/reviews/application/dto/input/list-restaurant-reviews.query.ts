import { ListReviewsQuery } from './list-reviews.query';

export interface ListRestaurantReviewsQuery extends ListReviewsQuery {
  restaurantId: string;
}
