export interface RestaurantDeleteRequest {
  restaurantId: string;
  ownerId: string;
  enforceOwnership?: boolean;
}
