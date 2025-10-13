import { Injectable } from '@nestjs/common';
import {
  CreateReviewCommand,
  DeleteReviewCommand,
  DeleteReviewResponseDto,
  FindReviewQuery,
  ListRestaurantReviewsQuery,
  ListReviewsQuery,
  PaginatedReviewResponse,
  ReviewResponseDto,
  UpdateReviewCommand,
} from '../dto/index.js';
import {
  CreateReviewUseCase,
  DeleteReviewUseCase,
  FindReviewUseCase,
  ListRestaurantReviewsUseCase,
  ListReviewsUseCase,
  UpdateReviewUseCase,
} from '../use-cases/index.js';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly listReviewsUseCase: ListReviewsUseCase,
    private readonly listRestaurantReviewsUseCase: ListRestaurantReviewsUseCase,
    private readonly findReviewUseCase: FindReviewUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase,
  ) {}

  async create(command: CreateReviewCommand): Promise<ReviewResponseDto> {
    return this.createReviewUseCase.execute(command);
  }

  async list(query: ListReviewsQuery): Promise<PaginatedReviewResponse> {
    return this.listReviewsUseCase.execute(query);
  }

  async listByRestaurant(
    query: ListRestaurantReviewsQuery,
  ): Promise<PaginatedReviewResponse> {
    return this.listRestaurantReviewsUseCase.execute(query);
  }

  async findOne(query: FindReviewQuery): Promise<ReviewResponseDto> {
    return this.findReviewUseCase.execute(query);
  }

  async update(command: UpdateReviewCommand): Promise<ReviewResponseDto> {
    return this.updateReviewUseCase.execute(command);
  }

  async delete(command: DeleteReviewCommand): Promise<DeleteReviewResponseDto> {
    return this.deleteReviewUseCase.execute(command);
  }
}
