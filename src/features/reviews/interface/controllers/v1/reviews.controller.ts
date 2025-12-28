import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UUIDPipe } from '@shared/interface/pipes/uuid.pipe';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
import type { CurrentUserPayload } from '@features/auth/interface/decorators/current-user.decorator';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import {
  ThrottleCreate,
  ThrottleModify,
  ThrottleSearch,
  ThrottleRead,
} from '@shared/infrastructure/decorators';
import {
  CreateReviewDto,
  ReviewsService,
  UpdateReviewDto,
  ModerateReviewDto,
  ReviewsAccessService,
} from '@features/reviews/application';
import type {
  ListReviewsQuery,
  FindReviewQuery,
  PaginatedReviewResponse,
  ListRestaurantReviewsQuery,
} from '@features/reviews/application';
import { GetReviewAnalyticsUseCase } from '@features/reviews/application/use-cases/get-review-analytics.use-case';
import type {
  CreateReviewCommand,
  DeleteReviewCommand,
  UpdateReviewCommand,
  ReviewResponseDto,
  DeleteReviewResponseDto,
  ModerateReviewCommand,
} from '@features/reviews/application';
import { ReviewAnalyticsRequestDto } from '@features/reviews/interface/dto/review-analytics.request.dto';
import { ReviewAnalyticsResponseDto } from '@features/reviews/interface/dto/review-analytics.response.dto';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import type { PaginatedQueryParams } from '@shared/application/types';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { ReviewResponseSwaggerDto } from '@features/reviews/interface/dto';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';

@ApiTags('Reviews')
@Controller({ path: 'reviews', version: '1' })
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly getReviewAnalytics: GetReviewAnalyticsUseCase,
    private readonly accessService: ReviewsAccessService,
  ) {}

  // --- Public Endpoints ---

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar reseñas públicas (paginado)' })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/reviews', allowExtraParams: true })
    query: ListReviewsQuery,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<PaginatedReviewResponse> {
    if (user?.roles?.some((r) => r.name === (AuthRoleName.OWNER as string))) {
      const restaurantId = await this.accessService.findRestaurantIdByOwner(
        user.userId,
      );
      if (restaurantId) {
        const restaurantQuery: ListRestaurantReviewsQuery = {
          ...query,
          restaurantId,
        };
        return this.reviewsService.listByRestaurant(restaurantQuery);
      }
    }
    return this.reviewsService.list(query);
  }

  @Get('restaurant/:restaurantId')
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar reseñas públicas por restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiPaginationQuery()
  async findByRestaurant(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @PaginationParams({
      defaultRoute: '/reviews/restaurant',
      allowExtraParams: true,
    })
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
  async findOne(@Param('id', UUIDPipe) id: string): Promise<ReviewResponseDto> {
    const query: FindReviewQuery = { reviewId: id };
    return this.reviewsService.findOne(query);
  }

  // --- Admin / Protected Endpoints ---

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ThrottleCreate()
  @Permissions('review:create')
  @ApiOperation({ summary: 'Crear una reseña (permiso review:create)' })
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ThrottleModify()
  @Permissions('review:update')
  @ApiOperation({ summary: 'Actualizar reseña propia (permiso review:update)' })
  @ApiParam({ name: 'id', description: 'UUID de la reseña' })
  @ApiBody({ type: UpdateReviewDto })
  async update(
    @Param('id', UUIDPipe) id: string,
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ThrottleModify()
  @Permissions('review:delete')
  @ApiOperation({ summary: 'Eliminar reseña propia (permiso review:delete)' })
  @ApiParam({ name: 'id', description: 'UUID de la reseña' })
  async remove(
    @Param('id', UUIDPipe) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteReviewResponseDto> {
    const command: DeleteReviewCommand = {
      reviewId: id,
      userId: user.userId,
    };
    return this.reviewsService.delete(command);
  }

  @Post(':id/moderate')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ThrottleModify()
  @Permissions('review:update')
  @ApiOperation({ summary: 'Moderar reseña (permiso review:update)' })
  @ApiParam({ name: 'id', description: 'UUID de la reseña' })
  @ApiBody({ type: ModerateReviewDto })
  @ApiOkResponse({ type: ReviewResponseSwaggerDto })
  async moderate(
    @Param('id', UUIDPipe) id: string,
    @Body() dto: ModerateReviewDto,
  ): Promise<ReviewResponseDto> {
    // Support both field-based moderation (rating/comment/hideComment)
    // and action-based moderation ({ action: 'approve'|'reject'|'hide', moderationNotes })
    const command: ModerateReviewCommand = { ...dto, reviewId: id } as any;

    if (dto.action) {
      const action = dto.action;
      if (action === 'hide') {
        command.hideComment = true;
      } else if (action === 'reject') {
        // reject -> hide and remove comment
        command.hideComment = true;
        command.comment = null as any;
      } else if (action === 'approve') {
        command.hideComment = false;
      }
      // If moderationNotes provided, store them in comment if comment is null
      if (dto.moderationNotes) {
        // append or replace comment with moderation note depending on existing comment
        command.comment = dto.moderationNotes;
      }
    }

    return this.reviewsService.moderate(command);
  }

  @Get('analytics/stats')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ThrottleSearch()
  @Permissions('review:read')
  @ApiOperation({ summary: 'Indicadores analíticos de reseñas' })
  async analytics(
    @Query() query: ReviewAnalyticsRequestDto,
  ): Promise<ReviewAnalyticsResponseDto> {
    const analytics = await this.getReviewAnalytics.execute(query.toQuery());
    return ReviewAnalyticsResponseDto.fromApplication(analytics);
  }
}
