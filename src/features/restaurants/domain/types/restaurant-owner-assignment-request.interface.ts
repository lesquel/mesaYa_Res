export interface RestaurantOwnerAssignmentRequest {
  restaurantId: string;
  ownerId: string;
  enforceOwnership?: boolean;
}
