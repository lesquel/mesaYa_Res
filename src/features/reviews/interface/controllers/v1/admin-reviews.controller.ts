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
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
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
  ListReviewsQuery,
  FindReviewQuery,
  PaginatedReviewResponse,
  ModerateReviewDto,
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
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { ReviewResponseSwaggerDto } from '@features/reviews/interface/dto';

@ApiTags('Reviews - Admin')
@Controller({ path: 'admin/reviews', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly getReviewAnalytics: GetReviewAnalyticsUseCase,
  ) {}

  @Get()
  @ThrottleRead()
  @Permissions('review:read')
  @ApiOperation({ summary: 'Listar reseñas (permiso review:read)' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: ReviewResponseSwaggerDto,
    description: 'Listado paginado de reseñas',
  })
  async list(
    @PaginationParams({ defaultRoute: '/admin/reviews' })
    pagination: PaginatedQueryParams,
  ): Promise<PaginatedReviewResponse> {
    const query: ListReviewsQuery = { ...pagination };
    return this.reviewsService.list(query);
  }

  @Get(':id')
  @ThrottleRead()
  @Permissions('review:read')
  @ApiOperation({ summary: 'Obtener reseña por ID (permiso review:read)' })
  @ApiParam({ name: 'id', description: 'UUID de la reseña' })
  @ApiOkResponse({ type: ReviewResponseSwaggerDto })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReviewResponseDto> {
    const query: FindReviewQuery = { reviewId: id };
    return this.reviewsService.findOne(query);
  }

  @Post()
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

  @Get('analytics')
  @ThrottleSearch()
  @Permissions('review:read')
  @ApiOperation({ summary: 'Indicadores analíticos de reseñas' })
  async analytics(
    @Query() query: ReviewAnalyticsRequestDto,
  ): Promise<ReviewAnalyticsResponseDto> {
    const analytics = await this.getReviewAnalytics.execute(query.toQuery());
    return ReviewAnalyticsResponseDto.fromApplication(analytics);
  }

  @Patch(':id')
  @ThrottleModify()
  @Permissions('review:update')
  @ApiOperation({ summary: 'Actualizar reseña propia (permiso review:update)' })
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
  @Permissions('review:delete')
  @ApiOperation({ summary: 'Eliminar reseña propia (permiso review:delete)' })
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

  @Post(':id/moderate')
  @ThrottleModify()
  @Permissions('review:update')
  @ApiOperation({ summary: 'Moderar reseña (permiso review:update)' })
  @ApiParam({ name: 'id', description: 'UUID de la reseña' })
  @ApiBody({ type: ModerateReviewDto })
  @ApiOkResponse({ type: ReviewResponseSwaggerDto })
  async moderate(
    @Param('id', ParseUUIDPipe) id: string,
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
}
