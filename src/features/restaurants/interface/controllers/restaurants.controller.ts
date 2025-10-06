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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/guard/jwt-auth.guard.js';
import { PermissionsGuard } from '../../../../auth/guard/permissions.guard.js';
import { Permissions } from '../../../../auth/decorator/permissions.decorator.js';
import { CurrentUser } from '../../../../auth/decorator/current-user.decorator.js';
import { PaginationDto } from '../../../../shared/dto/pagination.dto.js';
import {
  CreateRestaurantUseCase,
  DeleteRestaurantUseCase,
  FindRestaurantUseCase,
  ListOwnerRestaurantsUseCase,
  ListRestaurantsUseCase,
  UpdateRestaurantUseCase,
  CreateRestaurantCommand,
  CreateRestaurantDto,
  UpdateRestaurantCommand,
  UpdateRestaurantDto,
  DeleteRestaurantCommand,
  ListRestaurantsQuery,
  ListOwnerRestaurantsQuery,
  FindRestaurantQuery,
} from '../../application/index.js';
import {
  InvalidRestaurantDataError,
  RestaurantNotFoundError,
  RestaurantOwnerNotFoundError,
  RestaurantOwnershipError,
} from '../../domain/index.js';
import type { Request } from 'express';

@ApiTags('Restaurants')
@Controller('restaurant')
export class RestaurantsController {
  constructor(
    private readonly createRestaurantUseCase: CreateRestaurantUseCase,
    private readonly listRestaurantsUseCase: ListRestaurantsUseCase,
    private readonly listOwnerRestaurantsUseCase: ListOwnerRestaurantsUseCase,
    private readonly findRestaurantUseCase: FindRestaurantUseCase,
    private readonly updateRestaurantUseCase: UpdateRestaurantUseCase,
    private readonly deleteRestaurantUseCase: DeleteRestaurantUseCase,
  ) {}

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
      return await this.createRestaurantUseCase.execute(command);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar restaurantes (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'q', required: false, type: String })
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
      return await this.listRestaurantsUseCase.execute(query);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('restaurant:read')
  @ApiOperation({ summary: 'Listar mis restaurantes (owner actual)' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'q', required: false, type: String })
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
      return await this.listOwnerRestaurantsUseCase.execute(query);
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
      return await this.findRestaurantUseCase.execute(query);
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
      return await this.updateRestaurantUseCase.execute(command);
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
      return await this.deleteRestaurantUseCase.execute(command);
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
