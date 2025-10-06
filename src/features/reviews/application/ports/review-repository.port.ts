import { Review } from '../../domain/index.js';
import { ListReviewsQuery, ListRestaurantReviewsQuery } from '../dto/index.js';
import { PaginatedResult } from '@shared/application/interfaces/pagination.js';

export const REVIEW_REPOSITORY = Symbol('REVIEW_REPOSITORY');

export interface ReviewRepositoryPort {
  save(review: Review): Promise<Review>;
  findById(id: string): Promise<Review | null>;
  findByUserAndRestaurant(
    userId: string,
    restaurantId: string,
  ): Promise<Review | null>;
  delete(id: string): Promise<void>;
  paginate(query: ListReviewsQuery): Promise<PaginatedResult<Review>>;
  paginateByRestaurant(
    query: ListRestaurantReviewsQuery,
  ): Promise<PaginatedResult<Review>>;
}
