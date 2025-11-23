import { Controller, Get, Param } from '@nestjs/common';
import { UUIDPipe } from '@shared/interface/pipes/uuid.pipe';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { ThrottleRead } from '@shared/infrastructure/decorators';
import { ReviewsService } from '@features/reviews/application';
import type {
  FindReviewQuery,
  ListReviewsQuery,
  ListRestaurantReviewsQuery,
  ReviewResponseDto,
  PaginatedReviewResponse,
} from '@features/reviews/application';

@ApiTags('Reviews - Public')
@Controller({ path: 'public/reviews', version: '1' })
export class PublicReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar reseñas públicas (paginado)' })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/public/reviews' })
    query: ListReviewsQuery,
  ): Promise<PaginatedReviewResponse> {
    return this.reviewsService.list(query);
  }

  @Get('restaurant/:restaurantId')
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar reseñas públicas por restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiPaginationQuery()
  async findByRestaurant(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @PaginationParams({ defaultRoute: '/public/reviews/restaurant' })
    pagination: ListReviewsQuery,
  ): Promise<PaginatedReviewResponse> {
    const query: ListRestaurantReviewsQuery = {
      restaurantId,
      ...pagination,
    };
    return this.reviewsService.listByRestaurant(query);
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener una reseña pública por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la reseña' })
  async findOne(
    @Param('id', UUIDPipe) id: string,
  ): Promise<ReviewResponseDto> {
    const query: FindReviewQuery = { reviewId: id };
    return this.reviewsService.findOne(query);
  }
}
