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
  MenuResponseDto,
  DeleteMenuDto,
  DeleteMenuResponseDto,
  MenuListResponseDto,
  ListMenusQuery,
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

  @Get()
  @ThrottleRead()
  @Permissions('menu:read')
  @ApiOperation({ summary: 'Listar menús administrativamente (paginado)' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: MenuResponseSwaggerDto,
    description: 'Listado paginado de menús',
  })
  async findAll(
    @PaginationParams({ defaultRoute: '/admin/menus' })
    pagination: PaginatedQueryParams,
    @Query('restaurantId') restaurantId?: string,
  ): Promise<MenuListResponseDto> {
    const query: ListMenusQuery = {
      ...pagination,
      restaurantId,
    };
    return this.menuService.findAll(query);
  }

  @Get(':menuId')
  @ThrottleRead()
  @Permissions('menu:read')
  @ApiOperation({ summary: 'Obtener detalles de un menú' })
  @ApiParam({ name: 'menuId', description: 'UUID del menú' })
  @ApiOkResponse({
    description: 'Detalle del menú',
    type: MenuResponseSwaggerDto,
  })
  findById(
    @Param('menuId', ParseUUIDPipe) menuId: string,
  ): Promise<MenuResponseDto> {
    return this.menuService.findById({ menuId });
  }

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
