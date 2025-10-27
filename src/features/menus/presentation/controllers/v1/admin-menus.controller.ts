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
  MenuResponseDto,
  DeleteMenuDto,
  DeleteMenuResponseDto,
} from '@features/menus/application';
import { MenuService } from '@features/menus/application';
import {
  CreateMenuRequestDto,
  DeleteMenuResponseSwaggerDto,
  MenuResponseSwaggerDto,
  UpdateMenuRequestDto,
} from '@features/menus/presentation/dto';

@ApiTags('Menus - Admin')
@Controller({ path: 'admin/menus', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminMenusController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ThrottleCreate()
  @Permissions('menu:create')
  @ApiBody({ type: CreateMenuRequestDto })
  @ApiCreatedResponse({
    description: 'Menu created',
    type: MenuResponseSwaggerDto,
  })
  create(@Body() dto: CreateMenuRequestDto): Promise<MenuResponseDto> {
    return this.menuService.create(dto);
  }

  @Patch(':menuId')
  @ThrottleModify()
  @Permissions('menu:update')
  @ApiBody({ type: UpdateMenuRequestDto })
  @ApiOkResponse({
    description: 'Menu updated',
    type: MenuResponseSwaggerDto,
  })
  update(
    @Param('menuId') menuId: string,
    @Body() dto: UpdateMenuRequestDto,
  ): Promise<MenuResponseDto> {
    return this.menuService.update({ ...dto, menuId });
  }

  @Delete(':menuId')
  @ThrottleModify()
  @Permissions('menu:delete')
  @ApiOkResponse({
    description: 'Menu deleted',
    type: DeleteMenuResponseSwaggerDto,
  })
  delete(@Param('menuId') menuId: string): Promise<DeleteMenuResponseDto> {
    const deleteDto: DeleteMenuDto = { menuId };
    return this.menuService.delete(deleteDto);
  }
}
