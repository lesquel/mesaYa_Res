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
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import type {
  MenuResponseDto,
  DeleteMenuDto,
  DeleteMenuResponseDto,
  MenuListResponseDto,
  ListMenusQuery,
} from '@features/menus/application';
import {
  MenuService,
  GetMenuAnalyticsUseCase,
  MenusAccessService,
} from '@features/menus/application';
import {
  CreateMenuRequestDto,
  DeleteMenuResponseSwaggerDto,
  MenuResponseSwaggerDto,
  UpdateMenuRequestDto,
  MenuAnalyticsRequestDto,
  MenuAnalyticsResponseDto,
} from '@features/menus/presentation/dto';

@ApiTags('Menus')
@Controller({ path: 'menus', version: '1' })
export class MenusController {
  constructor(
    private readonly menuService: MenuService,
    private readonly getMenuAnalyticsUseCase: GetMenuAnalyticsUseCase,
    private readonly accessService: MenusAccessService,
  ) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar menús (paginado)' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: MenuResponseSwaggerDto,
    description: 'Listado paginado de menús',
  })
  async findAll(
    @PaginationParams({ defaultRoute: '/menus', allowExtraParams: true })
    pagination: PaginatedQueryParams,
    @Query('restaurantId') restaurantId?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<MenuListResponseDto> {
    if (user?.roles?.some((r) => r.name === (AuthRoleName.OWNER as string))) {
      if (!restaurantId) {
        const foundId = await this.accessService.findRestaurantIdByOwner(
          user.userId,
        );
        if (foundId) {
          restaurantId = foundId;
        }
      }
    }
    const query: ListMenusQuery = {
      ...pagination,
      restaurantId,
    };
    return this.menuService.findAll(query);
  }

  @Get('restaurant/:restaurantId')
  @ThrottleRead()
  @ApiOperation({
    summary: 'Listar menús por restaurante (paginado)',
  })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: MenuResponseSwaggerDto,
    description: 'Listado paginado de menús de un restaurante',
  })
  findByRestaurant(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @PaginationParams({
      defaultRoute: '/menus/restaurant',
      allowExtraParams: true,
    })
    query: PaginatedQueryParams,
  ): Promise<MenuListResponseDto> {
    return this.menuService.findByRestaurant(restaurantId, {
      ...query,
      route: `/menus/restaurant/${restaurantId}`,
    });
  }

  @Get('analytics')
  @ThrottleSearch()
  @ApiOperation({ summary: 'Analytics de menús' })
  @ApiOkResponse({
    description: 'Menu analytics',
    type: MenuAnalyticsResponseDto,
  })
  async getAnalytics(
    @Query() dto: MenuAnalyticsRequestDto,
  ): Promise<MenuAnalyticsResponseDto> {
    const analytics = await this.getMenuAnalyticsUseCase.execute(dto.toQuery());
    return MenuAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get(':menuId')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener detalles de un menú' })
  @ApiParam({ name: 'menuId', description: 'UUID del menú' })
  @ApiOkResponse({
    description: 'Detalle del menú',
    type: MenuResponseSwaggerDto,
  })
  findById(
    @Param('menuId', UUIDPipe) menuId: string,
  ): Promise<MenuResponseDto> {
    return this.menuService.findById({ menuId });
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ThrottleModify()
  @Permissions('menu:update')
  @ApiBody({ type: UpdateMenuRequestDto })
  @ApiOkResponse({
    description: 'Menu updated',
    type: MenuResponseSwaggerDto,
  })
  update(
    @Param('menuId', UUIDPipe) menuId: string,
    @Body() dto: UpdateMenuRequestDto,
  ): Promise<MenuResponseDto> {
    return this.menuService.update({ ...dto, menuId });
  }

  @Delete(':menuId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ThrottleModify()
  @Permissions('menu:delete')
  @ApiOkResponse({
    description: 'Menu deleted',
    type: DeleteMenuResponseSwaggerDto,
  })
  delete(
    @Param('menuId', UUIDPipe) menuId: string,
  ): Promise<DeleteMenuResponseDto> {
    const deleteDto: DeleteMenuDto = { menuId };
    return this.menuService.delete(deleteDto);
  }
}
