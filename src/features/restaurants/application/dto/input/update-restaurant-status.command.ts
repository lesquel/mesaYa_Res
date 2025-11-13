export type RestaurantStatusType = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export interface UpdateRestaurantStatusCommand {
  restaurantId: string;
  ownerId: string;
  status: RestaurantStatusType;
  adminNote?: string | null;
}
