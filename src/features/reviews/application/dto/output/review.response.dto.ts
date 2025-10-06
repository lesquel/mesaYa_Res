import { PaginatedResult } from '@shared/interfaces/pagination.js';

export interface ReviewResponseDto {
  id: string;
  restaurantId: string;
  userId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PaginatedReviewResponse = PaginatedResult<ReviewResponseDto>;
