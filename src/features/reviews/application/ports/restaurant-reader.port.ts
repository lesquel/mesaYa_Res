export const RESTAURANT_REVIEW_READER = Symbol('RESTAURANT_REVIEW_READER');

export interface RestaurantReviewReaderPort {
  exists(restaurantId: string): Promise<boolean>;
}
