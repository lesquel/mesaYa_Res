import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto.js';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {}

export type UpdateReviewCommand = UpdateReviewDto & {
  reviewId: string;
  userId: string;
};
