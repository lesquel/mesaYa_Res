import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
  CreateReviewDto,
  ReviewsService,
  UpdateReviewDto,
} from '@features/reviews/application/index';
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

@ApiTags('Reviews')
@Controller({ path: 'review', version: '1' })
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
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
  @ApiOperation({ summary: 'Listar reseñas (paginado)' })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/review' })
    query: ListReviewsQuery,
  ): Promise<PaginatedReviewResponse> {
    return this.reviewsService.list(query);
  }

  @Get('restaurant/:restaurantId')
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
  @ApiOperation({ summary: 'Obtener una reseña por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la reseña' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReviewResponseDto> {
    const query: FindReviewQuery = { reviewId: id };
    return this.reviewsService.findOne(query);
  }

  @Patch(':id')
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
