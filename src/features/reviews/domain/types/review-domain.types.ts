export interface ReviewCreateRequest {
  restaurantId: string;
  userId: string;
  rating: number;
  comment?: string | null;
}

export interface ReviewUpdateRequest {
  reviewId: string;
  userId: string;
  rating?: number;
  comment?: string | null;
}

export interface ReviewDeleteRequest {
  reviewId: string;
  userId: string;
}
