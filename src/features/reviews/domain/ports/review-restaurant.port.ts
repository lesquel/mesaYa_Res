export const REVIEW_RESTAURANT_PORT: unique symbol = Symbol(
  'REVIEW_RESTAURANT_PORT',
);

export interface ReviewRestaurantPort {
  exists(restaurantId: string): Promise<boolean>;
}
