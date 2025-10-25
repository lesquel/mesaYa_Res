import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import {
  ThrottleCreate,
  ThrottleRead,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  CreateReviewDto,
  ReviewsService,
  UpdateReviewDto,
} from '@features/reviews/application/index';
import { GetReviewAnalyticsUseCase } from '@features/reviews/application/use-cases/get-review-analytics.use-case';
import type {
  CreateReviewCommand,
  DeleteReviewCommand,
  FindReviewQuery,
  ListReviewsQuery,
  ListRestaurantReviewsQuery,
  UpdateReviewCommand,
  ReviewResponseDto,
  PaginatedReviewResponse,
  DeleteReviewResponseDto,
} from '@features/reviews/application/index';
import { ReviewAnalyticsRequestDto } from '@features/reviews/interface/dto/review-analytics.request.dto';
import { ReviewAnalyticsResponseDto } from '@features/reviews/interface/dto/review-analytics.response.dto';

@ApiTags('Reviews')
@Controller({ path: 'review', version: '1' })
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly getReviewAnalytics: GetReviewAnalyticsUseCase,
  ) {}

  @Post()
  @ThrottleCreate()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('review:create')
  @ApiOperation({ summary: 'Crear una reseña (permiso review:create)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateReviewDto })
  async create(
    @Body() dto: CreateReviewDto,
    @CurrentUser() user: { userId: string },
  ): Promise<ReviewResponseDto> {
    const command: CreateReviewCommand = {
      ...dto,
      userId: user.userId,
    };
    return this.reviewsService.create(command);
  }

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar reseñas (paginado)' })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/review' })
    query: ListReviewsQuery,
  ): Promise<PaginatedReviewResponse> {
    return this.reviewsService.list(query);
  }

  @Get('analytics')
  @ThrottleSearch()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('review:read')
  @ApiOperation({ summary: 'Indicadores analíticos de reseñas' })
  @ApiBearerAuth()
  async analytics(
    @Query() query: ReviewAnalyticsRequestDto,
  ): Promise<ReviewAnalyticsResponseDto> {
    const analytics = await this.getReviewAnalytics.execute(query.toQuery());
    return ReviewAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get('restaurant/:restaurantId')
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar reseñas por restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiPaginationQuery()
  async findByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @PaginationParams({ defaultRoute: '/review/restaurant' })
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
  @ApiOperation({ summary: 'Obtener una reseña por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la reseña' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReviewResponseDto> {
    const query: FindReviewQuery = { reviewId: id };
    return this.reviewsService.findOne(query);
  }

  @Patch(':id')
  @ThrottleModify()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('review:update')
  @ApiOperation({ summary: 'Actualizar reseña propia (permiso review:update)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la reseña' })
  @ApiBody({ type: UpdateReviewDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
    @CurrentUser() user: { userId: string },
  ): Promise<ReviewResponseDto> {
    const command: UpdateReviewCommand = {
      ...dto,
      reviewId: id,
      userId: user.userId,
    };
    return this.reviewsService.update(command);
  }

  @Delete(':id')
  @ThrottleModify()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('review:delete')
  @ApiOperation({ summary: 'Eliminar reseña propia (permiso review:delete)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la reseña' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteReviewResponseDto> {
    const command: DeleteReviewCommand = {
      reviewId: id,
      userId: user.userId,
    };
    return this.reviewsService.delete(command);
  }
}
