export interface DeleteRestaurantCommand {
  restaurantId: string;
  ownerId: string;
  enforceOwnership?: boolean;
}
