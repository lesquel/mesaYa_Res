export interface RestaurantStatusUpdateRequest {
  restaurantId: string;
  ownerId: string;
  enforceOwnership?: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  adminNote?: string | null;
}
