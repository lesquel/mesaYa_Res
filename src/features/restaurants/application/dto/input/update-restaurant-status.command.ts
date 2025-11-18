export type RestaurantStatusType = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export interface UpdateRestaurantStatusCommand {
  restaurantId: string;
  ownerId: string;
  enforceOwnership?: boolean;
  status: RestaurantStatusType;
  adminNote?: string | null;
}
