import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  ThrottleRead,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import type {
  DishResponseDto,
  DishListResponseDto,
} from '@features/menus/application';
import {
  DishService,
  GetDishAnalyticsUseCase,
} from '@features/menus/application';
import {
  DishAnalyticsRequestDto,
  DishAnalyticsResponseDto,
  DishResponseSwaggerDto,
} from '@features/menus/presentation/dto';

@ApiTags('Dishes - Public')
@Controller({ path: 'public/dishes', version: '1' })
export class PublicDishesController {
  constructor(
    private readonly dishService: DishService,
    private readonly getDishAnalytics: GetDishAnalyticsUseCase,
  ) {}

  @Get()
  @ThrottleRead()
  @ApiOkResponse({
    description: 'Public dishes list',
    type: DishResponseSwaggerDto,
    isArray: true,
  })
  findAll(): Promise<DishListResponseDto> {
    return this.dishService.findAll();
  }

  @Get('analytics')
  @ThrottleSearch()
  @ApiOkResponse({
    description: 'Public dish analytics',
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
    description: 'Public dish details',
    type: DishResponseSwaggerDto,
  })
  findById(@Param('dishId') dishId: string): Promise<DishResponseDto> {
    return this.dishService.findById({ dishId });
  }
}
