import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type {
  CreateDishDto,
  UpdateDishDto,
  DishResponseDto,
  DishListResponseDto,
  DeleteDishDto,
  DeleteDishResponseDto,
} from '@features/menus/application';
import { DishService } from '@features/menus/application';

@ApiTags('Dishes')
@Controller('dishes')
export class DishesController {
  constructor(private readonly dishService: DishService) {}

  @Post()
  create(@Body() dto: CreateDishDto): Promise<DishResponseDto> {
    return this.dishService.create(dto);
  }

  @Get()
  findAll(): Promise<DishListResponseDto> {
    return this.dishService.findAll();
  }

  @Get(':dishId')
  findById(@Param('dishId') dishId: string): Promise<DishResponseDto> {
    return this.dishService.findById({ dishId });
  }

  @Patch(':dishId')
  update(
    @Param('dishId') dishId: string,
    @Body() dto: UpdateDishDto,
  ): Promise<DishResponseDto> {
    return this.dishService.update({ ...dto, dishId });
  }

  @Delete(':dishId')
  delete(@Param('dishId') dishId: string): Promise<DeleteDishResponseDto> {
    const deleteDto: DeleteDishDto = { dishId };
    return this.dishService.delete(deleteDto);
  }
}
