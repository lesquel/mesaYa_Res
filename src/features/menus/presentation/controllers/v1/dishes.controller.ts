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
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import {
  ThrottleCreate,
  ThrottleRead,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import type {
  DishResponseDto,
  DishListResponseDto,
  DeleteDishDto,
  DeleteDishResponseDto,
} from '@features/menus/application';
import {
  DishService,
  GetDishAnalyticsUseCase,
} from '@features/menus/application';
import {
  CreateDishRequestDto,
  DeleteDishResponseSwaggerDto,
  DishResponseSwaggerDto,
  DishAnalyticsRequestDto,
  DishAnalyticsResponseDto,
  UpdateDishRequestDto,
} from '@features/menus/presentation/dto/index';

@ApiTags('Dishes')
@Controller({ path: 'dishes', version: '1' })
export class DishesController {
  constructor(
    private readonly dishService: DishService,
    private readonly getDishAnalytics: GetDishAnalyticsUseCase,
  ) {}

  @Post()
  @ThrottleCreate()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('dish:create')
  @ApiBearerAuth()
  @ApiBody({ type: CreateDishRequestDto })
  @ApiCreatedResponse({
    description: 'Dish created',
    type: DishResponseSwaggerDto,
  })
  create(@Body() dto: CreateDishRequestDto): Promise<DishResponseDto> {
    return this.dishService.create(dto);
  }

  @Get()
  @ThrottleRead()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('dish:read')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Dishes list',
    type: DishResponseSwaggerDto,
    isArray: true,
  })
  findAll(): Promise<DishListResponseDto> {
    return this.dishService.findAll();
  }

  @Get('analytics')
  @ThrottleSearch()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('dish:read')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Resumen analítico de platos',
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('dish:read')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Dish details',
    type: DishResponseSwaggerDto,
  })
  findById(@Param('dishId') dishId: string): Promise<DishResponseDto> {
    return this.dishService.findById({ dishId });
  }

  @Patch(':dishId')
  @ThrottleModify()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('dish:update')
  @ApiBearerAuth()
  @ApiBody({ type: UpdateDishRequestDto })
  @ApiOkResponse({
    description: 'Dish updated',
    type: DishResponseSwaggerDto,
  })
  update(
    @Param('dishId') dishId: string,
    @Body() dto: UpdateDishRequestDto,
  ): Promise<DishResponseDto> {
    return this.dishService.update({ ...dto, dishId });
  }

  @Delete(':dishId')
  @ThrottleModify()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('dish:delete')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Dish deleted',
    type: DeleteDishResponseSwaggerDto,
  })
  delete(@Param('dishId') dishId: string): Promise<DeleteDishResponseDto> {
    const deleteDto: DeleteDishDto = { dishId };
    return this.dishService.delete(deleteDto);
  }
}
