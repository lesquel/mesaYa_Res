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
  CreateMenuDto,
  UpdateMenuDto,
  MenuResponseDto,
  MenuListResponseDto,
  DeleteMenuDto,
  DeleteMenuResponseDto,
} from '@features/menus/application';
import { MenuService } from '@features/menus/application';

@ApiTags('Menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  create(@Body() dto: CreateMenuDto): Promise<MenuResponseDto> {
    return this.menuService.create(dto);
  }

  @Get()
  findAll(): Promise<MenuListResponseDto> {
    return this.menuService.findAll();
  }

  @Get(':menuId')
  findById(@Param('menuId') menuId: string): Promise<MenuResponseDto> {
    return this.menuService.findById({ menuId });
  }

  @Patch(':menuId')
  update(
    @Param('menuId') menuId: string,
    @Body() dto: UpdateMenuDto,
  ): Promise<MenuResponseDto> {
    return this.menuService.update({ ...dto, menuId });
  }

  @Delete(':menuId')
  delete(@Param('menuId') menuId: string): Promise<DeleteMenuResponseDto> {
    const deleteDto: DeleteMenuDto = { menuId };
    return this.menuService.delete(deleteDto);
  }
}
