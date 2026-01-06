import { PaginatedResult } from '@shared/application/types';

export interface ReviewResponseDto {
  id: string;
  restaurantId: string;
  userId: string;
  userName: string | null;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PaginatedReviewResponse = PaginatedResult<ReviewResponseDto>;
