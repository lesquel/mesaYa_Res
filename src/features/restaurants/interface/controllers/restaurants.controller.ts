import {
  BadRequestException,
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
  UseGuards,
  Body,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/guard/jwt-auth.guard.js';
import { PermissionsGuard } from '../../../../auth/guard/permissions.guard.js';
import { Permissions } from '../../../../auth/decorator/permissions.decorator.js';
import { CurrentUser } from '../../../../auth/decorator/current-user.decorator.js';
import { PaginationDto } from '../../../../shared/application/dto/pagination.dto.js';
import { ApiPaginationQuery } from '../../../../shared/interface/swagger/decorators/api-pagination-query.decorator.js';
import {
  CreateRestaurantCommand,
  CreateRestaurantDto,
  DeleteRestaurantCommand,
  FindRestaurantQuery,
  ListOwnerRestaurantsQuery,
  ListRestaurantsQuery,
  RestaurantsService,
  UpdateRestaurantCommand,
  UpdateRestaurantDto,
} from '../../application/index.js';
import {
  InvalidRestaurantDataError,
  RestaurantNotFoundError,
  RestaurantOwnerNotFoundError,
  RestaurantOwnershipError,
} from '../../domain/index.js';
import type { Request } from 'express';

@ApiTags('Restaurants')
@Controller({ path: 'restaurant', version: '1' })
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('restaurant:create')
  @ApiOperation({ summary: 'Crear restaurante (permiso restaurant:create)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateRestaurantDto })
  async create(
    @Body() dto: CreateRestaurantDto,
    @CurrentUser() user: { userId: string },
  ) {
    try {
      const command: CreateRestaurantCommand = {
        ...dto,
        ownerId: user.userId,
      };
      return await this.restaurantsService.create(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar restaurantes (paginado)' })
  @ApiPaginationQuery()
  async findAll(@Query() pagination: PaginationDto, @Req() req: Request) {
    try {
      const route = req.baseUrl || req.path || '/restaurant';
      const query: ListRestaurantsQuery = {
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
      return await this.restaurantsService.list(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('restaurant:read')
  @ApiOperation({ summary: 'Listar mis restaurantes (owner actual)' })
  @ApiBearerAuth()
  @ApiPaginationQuery()
  async findMine(
    @Query() pagination: PaginationDto,
    @Req() req: Request,
    @CurrentUser() user: { userId: string },
  ) {
    try {
      const route = req.baseUrl || req.path || '/restaurant/me';
      const query: ListOwnerRestaurantsQuery = {
        ownerId: user.userId,
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
      return await this.restaurantsService.listByOwner(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un restaurante por ID' })
  @ApiParam({ name: 'id', description: 'UUID del restaurante' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const query: FindRestaurantQuery = { restaurantId: id };
      return await this.restaurantsService.findOne(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('restaurant:update')
  @ApiOperation({
    summary: 'Actualizar restaurante (permiso restaurant:update)',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID del restaurante' })
  @ApiBody({ type: UpdateRestaurantDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRestaurantDto,
    @CurrentUser() user: { userId: string },
  ) {
    try {
      const command: UpdateRestaurantCommand = {
        restaurantId: id,
        ownerId: user.userId,
        ...dto,
      };
      return await this.restaurantsService.update(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('restaurant:delete')
  @ApiOperation({ summary: 'Eliminar restaurante (permiso restaurant:delete)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID del restaurante' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { userId: string },
  ) {
    try {
      const command: DeleteRestaurantCommand = {
        restaurantId: id,
        ownerId: user.userId,
      };
      return await this.restaurantsService.delete(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof RestaurantOwnerNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof RestaurantNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof RestaurantOwnershipError) {
      throw new ForbiddenException(error.message);
    }
    if (error instanceof InvalidRestaurantDataError) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }
}
