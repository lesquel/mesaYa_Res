export interface ReassignRestaurantOwnerCommand {
  restaurantId: string;
  ownerId: string;
  enforceOwnership?: boolean;
}
