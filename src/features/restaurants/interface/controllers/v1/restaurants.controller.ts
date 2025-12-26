import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UUIDPipe } from '@shared/interface/pipes/uuid.pipe';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
import type { CurrentUserPayload } from '@features/auth/interface/decorators/current-user.decorator';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { ThrottleRead } from '@shared/infrastructure/decorators';
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantsService,
  GetRestaurantAnalyticsUseCase,
  FindRestaurantByNameUseCase,
} from '@features/restaurants/application';
import { ListRestaurantReservationsUseCase } from '@features/reservation/application/use-cases/list-restaurant-reservation.use-case';
import {
  ListRestaurantReservationsQuery,
  PaginatedReservationResponse,
} from '@features/reservation/application/dto';
import type {
  ListRestaurantsQuery,
  RestaurantResponseDto,
  PaginatedRestaurantResponse,
  ListNearbyRestaurantsQuery,
  ListOwnerRestaurantsQuery,
} from '@features/restaurants/application';
import { NearbyRestaurantsQueryDto } from '@features/restaurants/application';
import { RestaurantResponseSwaggerDto } from '@features/restaurants/interface/dto';
import { UpdateRestaurantStatusRequestDto } from '@features/restaurants/interface/dto';
import { ListRestaurantsQueryDto } from '@features/restaurants/interface/dto/list-restaurants.query.dto';
import { RestaurantAnalyticsRequestDto } from '@features/restaurants/interface/dto/restaurant-analytics.request.dto';
import { ScheduleSlotResponseDto } from '@features/restaurants/interface/dto';
import { RestaurantScheduleSlotRepository } from '@features/restaurants/infrastructure/database/typeorm/repositories/restaurant-schedule-slot.repository';
import { RolesGuard } from '@features/auth/interface/guards/roles.guard';
import { Roles } from '@features/auth/interface/decorators/roles.decorator';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';

@ApiTags('Restaurants')
@Controller({ path: 'restaurants', version: '1' })
export class RestaurantsController {
  constructor(
    private readonly restaurantsService: RestaurantsService,
    private readonly getRestaurantAnalytics: GetRestaurantAnalyticsUseCase,
    private readonly findRestaurantByName: FindRestaurantByNameUseCase,
    private readonly listRestaurantReservations: ListRestaurantReservationsUseCase,
    private readonly scheduleSlotRepository: RestaurantScheduleSlotRepository,
  ) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'List restaurants with filters' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: RestaurantResponseSwaggerDto,
    description: 'Paginated list of restaurants',
  })
  async findAll(
    @PaginationParams({ defaultRoute: '/restaurants', allowExtraParams: true })
    pagination: PaginatedQueryParams,
    @Query() filters: ListRestaurantsQueryDto,
  ): Promise<PaginatedRestaurantResponse> {
    const query: ListRestaurantsQuery = {
      ...pagination,
      name: filters.name,
      city: filters.city,
      cuisineType: filters.cuisineType,
      isActive: filters.isActive,
    };
    return this.restaurantsService.list(query);
  }

  @Get('nearby')
  @ThrottleRead()
  @ApiOperation({ summary: 'List nearby restaurants' })
  async findNearby(
    @Query(new ValidationPipe({ transform: true }))
    params: NearbyRestaurantsQueryDto,
  ): Promise<RestaurantResponseDto[]> {
    const query: ListNearbyRestaurantsQuery = {
      latitude: params.latitude,
      longitude: params.longitude,
      radiusKm: params.radiusKm,
      limit: params.limit,
    };
    return this.restaurantsService.listNearby(query);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AuthRoleName.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my restaurants (Owner)' })
  @ApiPaginationQuery()
  async findMine(
    @PaginationParams({
      defaultRoute: '/restaurants/me',
      allowExtraParams: true,
    })
    pagination: ListOwnerRestaurantsQuery,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PaginatedRestaurantResponse> {
    const query: ListOwnerRestaurantsQuery = {
      ...pagination,
      ownerId: user.userId,
    };
    return this.restaurantsService.listByOwner(query);
  }

  @Get('by-name/:name')
  @ThrottleRead()
  @ApiOperation({ summary: 'Get restaurant by name' })
  @ApiParam({ name: 'name', description: 'Restaurant name (case-insensitive)' })
  @ApiOkResponse({
    description: 'Restaurant details found by name',
    type: RestaurantResponseSwaggerDto,
  })
  async findByName(@Param('name') name: string): Promise<RestaurantResponseDto> {
    const restaurant = await this.findRestaurantByName.execute({ name });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with name "${name}" not found`);
    }
    return restaurant;
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Get restaurant by ID' })
  @ApiParam({ name: 'id', description: 'Restaurant UUID' })
  @ApiOkResponse({
    description: 'Restaurant details',
    type: RestaurantResponseSwaggerDto,
  })
  async findOne(
    @Param('id', UUIDPipe) id: string,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.findOne({ restaurantId: id });
  }

  @Get(':id/schedule-slots')
  @ThrottleRead()
  @ApiOperation({ summary: 'Get public schedule slots for a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant UUID' })
  @ApiOkResponse({
    description: 'List of schedule slots',
    type: ScheduleSlotResponseDto,
    isArray: true,
  })
  async getPublicScheduleSlots(
    @Param('id', UUIDPipe) id: string,
  ): Promise<ScheduleSlotResponseDto[]> {
    const slots = await this.scheduleSlotRepository.listByRestaurant(id);
    return slots.map(ScheduleSlotResponseDto.fromRecord);
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('restaurant:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create restaurant (Admin)' })
  @ApiBody({ type: CreateRestaurantDto })
  async create(
    @Body() dto: CreateRestaurantDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.create({
      ...dto,
      ownerId: user.userId,
    } as any);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant UUID' })
  @ApiBody({ type: UpdateRestaurantDto })
  async update(
    @Param('id', UUIDPipe) id: string,
    @Body() dto: UpdateRestaurantDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<RestaurantResponseDto> {
    const isAdmin = user.roles?.some((r) => r.name === AuthRoleName.ADMIN);

    if (isAdmin) {
      return this.restaurantsService.update({
        restaurantId: id,
        ...dto,
      } as any);
    } else {
      return this.restaurantsService.update({
        restaurantId: id,
        ...dto,
        ownerId: user.userId,
      } as any);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('restaurant:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete restaurant (Admin)' })
  async delete(@Param('id', UUIDPipe) id: string): Promise<any> {
    return this.restaurantsService.delete({ restaurantId: id } as any);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('restaurant:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update restaurant status (Admin)' })
  async updateStatus(
    @Param('id', UUIDPipe) id: string,
    @Body() dto: UpdateRestaurantStatusRequestDto,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.updateStatus({
      restaurantId: id,
      ...dto,
    } as any);
  }

  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('restaurant:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get restaurant analytics (Admin)' })
  async getAnalytics(
    @Param('id', UUIDPipe) id: string,
    @Query() query: RestaurantAnalyticsRequestDto,
  ): Promise<any> {
    return this.getRestaurantAnalytics.execute({
      restaurantId: id,
      ...query,
    } as any);
  }

  @Get(':id/reservations')
  @ThrottleRead()
  @ApiOperation({ summary: 'List reservations for a restaurant' })
  @ApiParam({ name: 'id', description: 'Restaurant UUID' })
  @ApiPaginationQuery()
  async getReservations(
    @Param('id', UUIDPipe) restaurantId: string,
    @PaginationParams({ defaultRoute: '/restaurants/:id/reservations' })
    pagination: PaginatedQueryParams,
  ): Promise<PaginatedReservationResponse> {
    const query: ListRestaurantReservationsQuery = {
      restaurantId,
      ...pagination,
    };
    return this.listRestaurantReservations.execute(query);
  }
}
