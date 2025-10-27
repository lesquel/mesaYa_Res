import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
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
  ThrottleModify,
} from '@shared/infrastructure/decorators';
import type {
  DishResponseDto,
  DeleteDishDto,
  DeleteDishResponseDto,
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
