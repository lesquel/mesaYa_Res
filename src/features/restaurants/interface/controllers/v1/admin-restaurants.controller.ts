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
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import {
  ThrottleCreate,
  ThrottleRead,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  CreateRestaurantCommand,
  CreateRestaurantDto,
  DeleteRestaurantCommand,
  UpdateRestaurantCommand,
  UpdateRestaurantDto,
  RestaurantsService,
  GetRestaurantAnalyticsUseCase,
} from '@features/restaurants/application';
import type {
  ListOwnerRestaurantsQuery,
  ListRestaurantsQuery,
  RestaurantResponseDto,
  PaginatedRestaurantResponse,
  DeleteRestaurantResponseDto,
} from '@features/restaurants/application';
import { RestaurantAnalyticsRequestDto } from '@features/restaurants/interface/dto/restaurant-analytics.request.dto';
import { RestaurantAnalyticsResponseDto } from '@features/restaurants/interface/dto/restaurant-analytics.response.dto';

@ApiTags('Restaurants - Admin')
@Controller({ path: 'admin/restaurants', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminRestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly getRestaurantAnalytics: GetRestaurantAnalyticsUseCase,
  ) {}

  @Post()
  @ThrottleCreate()
  @Permissions('restaurant:create')
  @ApiOperation({ summary: 'Crear restaurante (permiso restaurant:create)' })
  @ApiBody({ type: CreateRestaurantDto })
  async create(
    @Body() dto: CreateRestaurantDto,
    @CurrentUser() user: { userId: string },
  ): Promise<RestaurantResponseDto> {
    const command: CreateRestaurantCommand = {
      ...dto,
      ownerId: user.userId,
    };
    return this.restaurantsService.create(command);
  }

  @Get('me')
  @ThrottleRead()
  @Permissions('restaurant:read')
  @ApiOperation({ summary: 'Listar mis restaurantes (owner actual)' })
  @ApiPaginationQuery()
  async findMine(
    @PaginationParams({ defaultRoute: '/admin/restaurant/me' })
    pagination: ListRestaurantsQuery,
    @CurrentUser() user: { userId: string },
  ): Promise<PaginatedRestaurantResponse> {
    const query: ListOwnerRestaurantsQuery = {
      ...pagination,
      ownerId: user.userId,
    };
    return this.restaurantsService.listByOwner(query);
  }

  @Get('analytics')
  @ThrottleSearch()
  @Permissions('restaurant:read')
  @ApiOperation({ summary: 'Indicadores analíticos de restaurantes' })
  async analytics(
    @Query() query: RestaurantAnalyticsRequestDto,
  ): Promise<RestaurantAnalyticsResponseDto> {
    const analytics = await this.getRestaurantAnalytics.execute(
      query.toQuery(),
    );
    return RestaurantAnalyticsResponseDto.fromApplication(analytics);
  }

  @Patch(':id')
  @ThrottleModify()
  @Permissions('restaurant:update')
  @ApiOperation({
    summary: 'Actualizar restaurante (permiso restaurant:update)',
  })
  @ApiParam({ name: 'id', description: 'UUID del restaurante' })
  @ApiBody({ type: UpdateRestaurantDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRestaurantDto,
    @CurrentUser() user: { userId: string },
  ): Promise<RestaurantResponseDto> {
    const command: UpdateRestaurantCommand = {
      restaurantId: id,
      ownerId: user.userId,
      ...dto,
    };
    return this.restaurantsService.update(command);
  }

  @Delete(':id')
  @ThrottleModify()
  @Permissions('restaurant:delete')
  @ApiOperation({ summary: 'Eliminar restaurante (permiso restaurant:delete)' })
  @ApiParam({ name: 'id', description: 'UUID del restaurante' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteRestaurantResponseDto> {
    const command: DeleteRestaurantCommand = {
      restaurantId: id,
      ownerId: user.userId,
    };
    return this.restaurantsService.delete(command);
  }
}
