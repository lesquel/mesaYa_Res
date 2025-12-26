export interface ReviewUpdateRequest {
  reviewId: string;
  userId: string;
  rating?: number;
  comment?: string | null;
}
