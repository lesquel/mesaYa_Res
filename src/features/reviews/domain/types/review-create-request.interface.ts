export interface ReviewCreateRequest {
  restaurantId: string;
  userId: string;
  rating: number;
  comment?: string | null;
}
