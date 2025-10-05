import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard.js';
import { Permissions } from '../auth/decorator/permissions.decorator.js';
import { PermissionsGuard } from '../auth/guard/permissions.guard.js';
import { CurrentUser } from '../auth/decorator/current-user.decorator.js';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Restaurants')
@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('restaurant:create')
  @ApiOperation({ summary: 'Crear restaurante (permiso restaurant:create)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateRestaurantDto })
  create(
    @Body() createRestaurantDto: CreateRestaurantDto,
    @CurrentUser() user,
  ) {
    return this.restaurantService.create(createRestaurantDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar restaurantes (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'q', required: false, type: String })
  findAll(@Query() pagination: PaginationDto, @Req() req: Request) {
    const route = req.baseUrl || req.path || '/restaurant';
    return this.restaurantService.findAll(pagination, route);
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
  findMine(
    @Query() pagination: PaginationDto,
    @Req() req: Request,
    @CurrentUser() user,
  ) {
    const route = req.baseUrl || req.path || '/restaurant/me';
    return this.restaurantService.findMine(user.userId, pagination, route);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un restaurante por ID' })
  @ApiParam({ name: 'id', description: 'UUID del restaurante' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.restaurantService.findOne(id);
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @CurrentUser() user,
  ) {
    return this.restaurantService.update(id, updateRestaurantDto, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('restaurant:delete')
  @ApiOperation({ summary: 'Eliminar restaurante (permiso restaurant:delete)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID del restaurante' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user) {
    return this.restaurantService.remove(id, user.userId);
  }
}
