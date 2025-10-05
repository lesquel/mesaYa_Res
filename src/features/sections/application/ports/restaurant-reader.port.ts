export const RESTAURANT_SECTION_READER = Symbol('RESTAURANT_SECTION_READER');

export interface RestaurantSectionReaderPort {
  exists(restaurantId: string): Promise<boolean>;
}
