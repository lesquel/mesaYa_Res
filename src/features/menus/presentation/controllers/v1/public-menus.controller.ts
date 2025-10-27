import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  ThrottleRead,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import type {
  MenuResponseDto,
  MenuListResponseDto,
} from '@features/menus/application';
import {
  MenuService,
  GetMenuAnalyticsUseCase,
} from '@features/menus/application';
import {
  MenuAnalyticsRequestDto,
  MenuAnalyticsResponseDto,
  MenuResponseSwaggerDto,
} from '@features/menus/presentation/dto';

@ApiTags('Menus - Public')
@Controller({ path: 'public/menus', version: '1' })
export class PublicMenusController {
  constructor(
    private readonly menuService: MenuService,
    private readonly getMenuAnalyticsUseCase: GetMenuAnalyticsUseCase,
  ) {}

  @Get()
  @ThrottleRead()
  @ApiOkResponse({
    description: 'Public menus list',
    type: MenuResponseSwaggerDto,
    isArray: true,
  })
  findAll(): Promise<MenuListResponseDto> {
    return this.menuService.findAll();
  }

  @Get('analytics')
  @ThrottleSearch()
  @ApiOkResponse({
    description: 'Public menu analytics',
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
  @ApiOkResponse({
    description: 'Public menu details',
    type: MenuResponseSwaggerDto,
  })
  findById(@Param('menuId') menuId: string): Promise<MenuResponseDto> {
    return this.menuService.findById({ menuId });
  }
}
