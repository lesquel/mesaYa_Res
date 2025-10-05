import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
  Query,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard.js';
import { PermissionsGuard } from '../auth/guard/permissions.guard.js';
import { Permissions } from '../auth/decorator/permissions.decorator.js';
import { CurrentUser } from '../auth/decorator/current-user.decorator.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('review:create')
  @ApiOperation({ summary: 'Crear una reseña (permiso review:create)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateReviewDto })
  create(@Body() createReviewDto: CreateReviewDto, @CurrentUser() user) {
    return this.reviewService.create(createReviewDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar reseñas (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'q', required: false, type: String })
  findAll(@Query() pagination: PaginationDto, @Req() req: Request) {
    const route = req.baseUrl || req.path || '/review';
    return this.reviewService.findAll(pagination, route);
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Listar reseñas por restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Query() pagination: PaginationDto,
    @Req() req: Request,
  ) {
    const route = req.baseUrl || req.path || '/review';
    return this.reviewService.findByRestaurant(restaurantId, pagination, route);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reseña por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la reseña' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('review:update')
  @ApiOperation({ summary: 'Actualizar reseña propia (permiso review:update)' })
  @ApiBearerAuth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @CurrentUser() user,
  ) {
    return this.reviewService.update(id, updateReviewDto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('review:delete')
  @ApiOperation({ summary: 'Eliminar reseña propia (permiso review:delete)' })
  @ApiBearerAuth()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user) {
    return this.reviewService.remove(id, user.userId);
  }
}
