import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type {
  DishResponseDto,
  DishListResponseDto,
  DeleteDishDto,
  DeleteDishResponseDto,
} from '@features/menus/application';
import { DishService } from '@features/menus/application';
import {
  CreateDishRequestDto,
  DeleteDishResponseSwaggerDto,
  DishResponseSwaggerDto,
  UpdateDishRequestDto,
} from '@features/menus/presentation/dto/index.js';

@ApiTags('Dishes')
@Controller({ path: 'dishes', version: '1' })
export class DishesController {
  constructor(private readonly dishService: DishService) {}

  @Post()
  @ApiBody({ type: CreateDishRequestDto })
  @ApiCreatedResponse({
    description: 'Dish created',
    type: DishResponseSwaggerDto,
  })
  create(@Body() dto: CreateDishRequestDto): Promise<DishResponseDto> {
    return this.dishService.create(dto);
  }

  @Get()
  @ApiOkResponse({
    description: 'Dishes list',
    type: DishResponseSwaggerDto,
    isArray: true,
  })
  findAll(): Promise<DishListResponseDto> {
    return this.dishService.findAll();
  }

  @Get(':dishId')
  @ApiOkResponse({
    description: 'Dish details',
    type: DishResponseSwaggerDto,
  })
  findById(@Param('dishId') dishId: string): Promise<DishResponseDto> {
    return this.dishService.findById({ dishId });
  }

  @Patch(':dishId')
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
  @ApiOkResponse({
    description: 'Dish deleted',
    type: DeleteDishResponseSwaggerDto,
  })
  delete(@Param('dishId') dishId: string): Promise<DeleteDishResponseDto> {
    const deleteDto: DeleteDishDto = { dishId };
    return this.dishService.delete(deleteDto);
  }
}
