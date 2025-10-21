import type { ReviewResponseDto } from './review.response.dto';

export interface DeleteReviewResponseDto {
  ok: boolean;
  review: ReviewResponseDto;
}
