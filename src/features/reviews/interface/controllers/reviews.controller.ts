import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
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
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard.js';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator.js';
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator.js';
import { ApiPaginationQuery } from '../../../../shared/interface/swagger/decorators/api-pagination-query.decorator.js';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator.js';
import {
  CreateReviewDto,
  ReviewsService,
  UpdateReviewDto,
} from '../../application/index.js';
import type {
  CreateReviewCommand,
  DeleteReviewCommand,
  FindReviewQuery,
  ListReviewsQuery,
  ListRestaurantReviewsQuery,
  UpdateReviewCommand,
} from '../../application/index.js';
import {
  InvalidReviewDataError,
  ReviewNotFoundError,
  ReviewOwnershipError,
  ReviewRestaurantNotFoundError,
  ReviewUserNotFoundError,
} from '../../domain/index.js';

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
  ) {
    try {
      const command: CreateReviewCommand = {
        ...dto,
        userId: user.userId,
      };
      return await this.reviewsService.create(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar reseñas (paginado)' })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/review' })
    query: ListReviewsQuery,
  ) {
    try {
      return await this.reviewsService.list(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Listar reseñas por restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiPaginationQuery()
  async findByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @PaginationParams({ defaultRoute: '/review/restaurant' })
    pagination: ListReviewsQuery,
  ) {
    try {
      const query: ListRestaurantReviewsQuery = {
        restaurantId,
        ...pagination,
      };
      return await this.reviewsService.listByRestaurant(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reseña por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la reseña' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const query: FindReviewQuery = { reviewId: id };
      return await this.reviewsService.findOne(query);
    } catch (error) {
      this.handleError(error);
    }
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
  ) {
    try {
      const command: UpdateReviewCommand = {
        ...dto,
        reviewId: id,
        userId: user.userId,
      };
      return await this.reviewsService.update(command);
    } catch (error) {
      this.handleError(error);
    }
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
  ) {
    try {
      const command: DeleteReviewCommand = {
        reviewId: id,
        userId: user.userId,
      };
      return await this.reviewsService.delete(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof ReviewNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof ReviewOwnershipError) {
      throw new ForbiddenException(error.message);
    }
    if (error instanceof ReviewRestaurantNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof ReviewUserNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof InvalidReviewDataError) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }
}
