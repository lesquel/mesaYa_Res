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
import {
  ThrottleCreate,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  CreateReviewDto,
  ReviewsService,
  UpdateReviewDto,
} from '@features/reviews/application';
import { GetReviewAnalyticsUseCase } from '@features/reviews/application/use-cases/get-review-analytics.use-case';
import type {
  CreateReviewCommand,
  DeleteReviewCommand,
  UpdateReviewCommand,
  ReviewResponseDto,
  DeleteReviewResponseDto,
} from '@features/reviews/application';
import { ReviewAnalyticsRequestDto } from '@features/reviews/interface/dto/review-analytics.request.dto';
import { ReviewAnalyticsResponseDto } from '@features/reviews/interface/dto/review-analytics.response.dto';

@ApiTags('Reviews - Admin')
@Controller({ path: 'admin/review', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly getReviewAnalytics: GetReviewAnalyticsUseCase,
  ) {}

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
}
