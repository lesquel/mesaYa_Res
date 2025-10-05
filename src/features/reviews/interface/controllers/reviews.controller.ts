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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/guard/jwt-auth.guard.js';
import { PermissionsGuard } from '../../../../auth/guard/permissions.guard.js';
import { Permissions } from '../../../../auth/decorator/permissions.decorator.js';
import { CurrentUser } from '../../../../auth/decorator/current-user.decorator.js';
import { PaginationDto } from '../../../../common/dto/pagination.dto.js';
import {
  CreateReviewCommand,
  CreateReviewDto,
} from '../../application/dto/input/create-review.dto.js';
import {
  UpdateReviewCommand,
  UpdateReviewDto,
} from '../../application/dto/input/update-review.dto.js';
import { ListReviewsQuery } from '../../application/dto/input/list-reviews.query.js';
import { ListRestaurantReviewsQuery } from '../../application/dto/input/list-restaurant-reviews.query.js';
import { FindReviewQuery } from '../../application/dto/input/find-review.query.js';
import { DeleteReviewCommand } from '../../application/dto/input/delete-review.command.js';
import { CreateReviewUseCase } from '../../application/use-cases/create-review.use-case.js';
import { ListReviewsUseCase } from '../../application/use-cases/list-reviews.use-case.js';
import { ListRestaurantReviewsUseCase } from '../../application/use-cases/list-restaurant-reviews.use-case.js';
import { FindReviewUseCase } from '../../application/use-cases/find-review.use-case.js';
import { UpdateReviewUseCase } from '../../application/use-cases/update-review.use-case.js';
import { DeleteReviewUseCase } from '../../application/use-cases/delete-review.use-case.js';
import { ReviewNotFoundError } from '../../domain/errors/review-not-found.error.js';
import { ReviewOwnershipError } from '../../domain/errors/review-ownership.error.js';
import { ReviewRestaurantNotFoundError } from '../../domain/errors/review-restaurant-not-found.error.js';
import { ReviewUserNotFoundError } from '../../domain/errors/review-user-not-found.error.js';
import { InvalidReviewDataError } from '../../domain/errors/invalid-review-data.error.js';
import type { Request } from 'express';

@ApiTags('Reviews')
@Controller('review')
export class ReviewsController {
  constructor(
    private readonly createReviewUseCase: CreateReviewUseCase,
    private readonly listReviewsUseCase: ListReviewsUseCase,
    private readonly listRestaurantReviewsUseCase: ListRestaurantReviewsUseCase,
    private readonly findReviewUseCase: FindReviewUseCase,
    private readonly updateReviewUseCase: UpdateReviewUseCase,
    private readonly deleteReviewUseCase: DeleteReviewUseCase,
  ) {}

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
      return await this.createReviewUseCase.execute(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar reseñas (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'q', required: false, type: String })
  async findAll(@Query() pagination: PaginationDto, @Req() req: Request) {
    try {
      const route = req.baseUrl || req.path || '/review';
      const query: ListReviewsQuery = {
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          offset: pagination.offset,
        },
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
        search: pagination.q,
        route,
      };
      return await this.listReviewsUseCase.execute(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Listar reseñas por restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'q', required: false, type: String })
  async findByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Query() pagination: PaginationDto,
    @Req() req: Request,
  ) {
    try {
      const route = req.baseUrl || req.path || '/review/restaurant';
      const query: ListRestaurantReviewsQuery = {
        restaurantId,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          offset: pagination.offset,
        },
        sortBy: pagination.sortBy,
        sortOrder: pagination.sortOrder,
        search: pagination.q,
        route,
      };
      return await this.listRestaurantReviewsUseCase.execute(query);
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
      return await this.findReviewUseCase.execute(query);
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
      return await this.updateReviewUseCase.execute(command);
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
      return await this.deleteReviewUseCase.execute(command);
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
