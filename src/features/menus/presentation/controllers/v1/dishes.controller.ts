import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UUIDPipe } from '@shared/interface/pipes/uuid.pipe';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
import type { CurrentUserPayload } from '@features/auth/interface/decorators/current-user.decorator';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import {
  ThrottleCreate,
  ThrottleRead,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import type {
  DishResponseDto,
  DishListResponseDto,
  DeleteDishResponseDto,
} from '@features/menus/application/dtos/output';
import { DeleteDishDto } from '@features/menus/application/dtos/input/delete-dish.dto';
import {
  DishService,
  GetDishAnalyticsUseCase,
  MenusAccessService,
} from '@features/menus/application';
import type { ListDishesQuery } from '@features/menus/application/dtos/input';
import {
  DishAnalyticsRequestDto,
  DishAnalyticsResponseDto,
  DishResponseSwaggerDto,
  CreateDishRequestDto,
  DeleteDishResponseSwaggerDto,
  UpdateDishRequestDto,
} from '@features/menus/presentation/dto';

@ApiTags('Dishes')
@Controller({ path: 'dishes', version: '1' })
export class DishesController {
  constructor(
    private readonly dishService: DishService,
    private readonly getDishAnalytics: GetDishAnalyticsUseCase,
    private readonly accessService: MenusAccessService,
  ) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar platos (paginado)' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: DishResponseSwaggerDto,
    description: 'Listado paginado de platos',
  })
  async findAll(
    @PaginationParams({ defaultRoute: '/dishes', allowExtraParams: true })
    query: ListDishesQuery,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<DishListResponseDto> {
    if (user?.roles?.some((r) => r.name === (AuthRoleName.OWNER as string))) {
      if (!query.restaurantId) {
        const restaurantId = await this.accessService.findRestaurantIdByOwner(
          user.userId,
        );
        if (restaurantId) {
          query.restaurantId = restaurantId;
        }
      }
    }
    return this.dishService.findAll(query);
  }

  @Get('restaurant/:restaurantId')
  @ThrottleRead()
  @ApiOperation({
    summary: 'Listar platos de un restaurante (paginado)',
  })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: DishResponseSwaggerDto,
    description: 'Listado paginado de platos para un restaurante',
  })
  findByRestaurant(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @PaginationParams({
      defaultRoute: '/dishes/restaurant',
      allowExtraParams: true,
    })
    query: ListDishesQuery,
  ): Promise<DishListResponseDto> {
    return this.dishService.findByRestaurant(restaurantId, {
      ...query,
      route: `/dishes/restaurant/${restaurantId}`,
    });
  }

  @Get('analytics')
  @ThrottleSearch()
  @ApiOkResponse({
    description: 'Dish analytics',
    type: DishAnalyticsResponseDto,
  })
  async analytics(
    @Query() query: DishAnalyticsRequestDto,
  ): Promise<DishAnalyticsResponseDto> {
    const analytics = await this.getDishAnalytics.execute(query.toQuery());
    return DishAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get(':dishId')
  @ThrottleRead()
  @ApiOkResponse({
    description: 'Dish details',
    type: DishResponseSwaggerDto,
  })
  findById(@Param('dishId') dishId: string): Promise<DishResponseDto> {
    return this.dishService.findById({ dishId });
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ThrottleCreate()
  @Permissions('dish:create')
  @ApiBody({ type: CreateDishRequestDto })
  @ApiCreatedResponse({
    description: 'Dish created',
    type: DishResponseSwaggerDto,
  })
  create(@Body() dto: CreateDishRequestDto): Promise<DishResponseDto> {
    return this.dishService.create(dto);
  }

  @Patch(':dishId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ThrottleModify()
  @Permissions('dish:update')
  @ApiBody({ type: UpdateDishRequestDto })
  @ApiOkResponse({
    description: 'Dish updated',
    type: DishResponseSwaggerDto,
  })
  update(
    @Param('dishId', UUIDPipe) dishId: string,
    @Body() dto: UpdateDishRequestDto,
  ): Promise<DishResponseDto> {
    return this.dishService.update({ ...dto, dishId });
  }

  @Delete(':dishId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ThrottleModify()
  @Permissions('dish:delete')
  @ApiOkResponse({
    description: 'Dish deleted',
    type: DeleteDishResponseSwaggerDto,
  })
  delete(
    @Param('dishId', UUIDPipe) dishId: string,
  ): Promise<DeleteDishResponseDto> {
    const deleteDto: DeleteDishDto = { dishId };
    return this.dishService.delete(deleteDto);
  }
}
