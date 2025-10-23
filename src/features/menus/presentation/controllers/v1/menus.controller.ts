import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type {
  MenuResponseDto,
  MenuListResponseDto,
  DeleteMenuDto,
  DeleteMenuResponseDto,
} from '@features/menus/application';
import {
  MenuService,
  GetMenuAnalyticsUseCase,
} from '@features/menus/application';
import {
  CreateMenuRequestDto,
  MenuAnalyticsRequestDto,
  MenuAnalyticsResponseDto,
  DeleteMenuResponseSwaggerDto,
  MenuResponseSwaggerDto,
  UpdateMenuRequestDto,
} from '@features/menus/presentation/dto/index';

@ApiTags('Menus')
@Controller({ path: 'menus', version: '1' })
export class MenusController {
  constructor(
    private readonly menuService: MenuService,
    private readonly getMenuAnalyticsUseCase: GetMenuAnalyticsUseCase,
  ) {}

  @Post()
  @ApiBody({ type: CreateMenuRequestDto })
  @ApiCreatedResponse({
    description: 'Menu created',
    type: MenuResponseSwaggerDto,
  })
  create(@Body() dto: CreateMenuRequestDto): Promise<MenuResponseDto> {
    return this.menuService.create(dto);
  }

  @Get()
  @ApiOkResponse({
    description: 'Menus list',
    type: MenuResponseSwaggerDto,
    isArray: true,
  })
  findAll(): Promise<MenuListResponseDto> {
    return this.menuService.findAll();
  }

  @Get('analytics')
  @ApiOkResponse({
    description: 'Resumen analítico de menús',
    type: MenuAnalyticsResponseDto,
  })
  async getAnalytics(
    @Query() dto: MenuAnalyticsRequestDto,
  ): Promise<MenuAnalyticsResponseDto> {
    const analytics = await this.getMenuAnalyticsUseCase.execute(dto.toQuery());
    return MenuAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get(':menuId')
  @ApiOkResponse({
    description: 'Menu details',
    type: MenuResponseSwaggerDto,
  })
  findById(@Param('menuId') menuId: string): Promise<MenuResponseDto> {
    return this.menuService.findById({ menuId });
  }

  @Patch(':menuId')
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
  @ApiOkResponse({
    description: 'Menu deleted',
    type: DeleteMenuResponseSwaggerDto,
  })
  delete(@Param('menuId') menuId: string): Promise<DeleteMenuResponseDto> {
    const deleteDto: DeleteMenuDto = { menuId };
    return this.menuService.delete(deleteDto);
  }
}
