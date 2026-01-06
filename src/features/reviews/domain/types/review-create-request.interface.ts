export interface ReviewCreateRequest {
  restaurantId: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  rating: number;
  comment?: string | null;
}
