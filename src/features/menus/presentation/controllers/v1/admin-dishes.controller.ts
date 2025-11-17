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
import {
  ThrottleCreate,
  ThrottleRead,
  ThrottleModify,
} from '@shared/infrastructure/decorators';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import type {
  DishResponseDto,
  DeleteDishDto,
  DeleteDishResponseDto,
  DishListResponseDto,
  ListDishesQuery,
} from '@features/menus/application';
import { DishService } from '@features/menus/application';
import {
  CreateDishRequestDto,
  DeleteDishResponseSwaggerDto,
  DishResponseSwaggerDto,
  UpdateDishRequestDto,
} from '@features/menus/presentation/dto';

@ApiTags('Dishes - Admin')
@Controller({ path: 'admin/dishes', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminDishesController {
  constructor(private readonly dishService: DishService) {}

  @Get()
  @ThrottleRead()
  @Permissions('dish:read')
  @ApiOperation({ summary: 'Listar platos administrativamente (paginado)' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: DishResponseSwaggerDto,
    description: 'Listado paginado de platos',
  })
  async findAll(
    @PaginationParams({ defaultRoute: '/admin/dishes' })
    pagination: PaginatedQueryParams,
    @Query('restaurantId') restaurantId?: string,
  ): Promise<DishListResponseDto> {
    const query: ListDishesQuery = {
      ...pagination,
      restaurantId,
    };
    return this.dishService.findAll(query);
  }

  @Get(':dishId')
  @ThrottleRead()
  @Permissions('dish:read')
  @ApiOperation({ summary: 'Obtener detalles de un plato' })
  @ApiParam({ name: 'dishId', description: 'UUID del plato' })
  @ApiOkResponse({
    description: 'Detalle del plato',
    type: DishResponseSwaggerDto,
  })
  findById(
    @Param('dishId', ParseUUIDPipe) dishId: string,
  ): Promise<DishResponseDto> {
    return this.dishService.findById({ dishId });
  }

  @Post()
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
  @ThrottleModify()
  @Permissions('dish:update')
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
  @Permissions('dish:delete')
  @ApiOkResponse({
    description: 'Dish deleted',
    type: DeleteDishResponseSwaggerDto,
  })
  delete(@Param('dishId') dishId: string): Promise<DeleteDishResponseDto> {
    const deleteDto: DeleteDishDto = { dishId };
    return this.dishService.delete(deleteDto);
  }
}
