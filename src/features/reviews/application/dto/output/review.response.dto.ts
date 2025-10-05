import { PaginatedResult } from '../../../../../shared/core/pagination.js';

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
