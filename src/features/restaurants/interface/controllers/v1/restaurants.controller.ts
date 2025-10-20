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
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard.js';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator.js';
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator.js';
import { ApiPaginationQuery } from '../../../../shared/interface/swagger/decorators/api-pagination-query.decorator.js';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator.js';
import {
  CreateRestaurantCommand,
  CreateRestaurantDto,
  DeleteRestaurantCommand,
  FindRestaurantQuery,
  RestaurantsService,
  UpdateRestaurantCommand,
  UpdateRestaurantDto,
} from '../../application/index.js';
import type {
  ListOwnerRestaurantsQuery,
  ListRestaurantsQuery,
} from '../../application/index.js';

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
    const command: CreateRestaurantCommand = {
      ...dto,
      ownerId: user.userId,
    };
    return this.restaurantsService.create(command);
  }

  @Get()
  @ApiOperation({ summary: 'Listar restaurantes (paginado)' })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/restaurant' })
    query: ListRestaurantsQuery,
  ) {
    return this.restaurantsService.list(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('restaurant:read')
  @ApiOperation({ summary: 'Listar mis restaurantes (owner actual)' })
  @ApiBearerAuth()
  @ApiPaginationQuery()
  async findMine(
    @PaginationParams({ defaultRoute: '/restaurant/me' })
    pagination: ListRestaurantsQuery,
    @CurrentUser() user: { userId: string },
  ) {
    const query: ListOwnerRestaurantsQuery = {
      ...pagination,
      ownerId: user.userId,
    };
    return this.restaurantsService.listByOwner(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un restaurante por ID' })
  @ApiParam({ name: 'id', description: 'UUID del restaurante' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const query: FindRestaurantQuery = { restaurantId: id };
    return this.restaurantsService.findOne(query);
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
    const command: UpdateRestaurantCommand = {
      restaurantId: id,
      ownerId: user.userId,
      ...dto,
    };
    return this.restaurantsService.update(command);
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
    const command: DeleteRestaurantCommand = {
      restaurantId: id,
      ownerId: user.userId,
    };
    return this.restaurantsService.delete(command);
  }
}
