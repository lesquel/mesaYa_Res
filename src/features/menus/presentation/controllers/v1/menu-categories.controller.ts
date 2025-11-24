import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UUIDPipe } from '@shared/interface/pipes/uuid.pipe';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiCreatedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
import type { CurrentUserPayload } from '@features/auth/interface/decorators/current-user.decorator';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import {
  ThrottleCreate,
  ThrottleModify,
  ThrottleRead,
} from '@shared/infrastructure/decorators';
import {
  MenuCategoryService,
  MenusAccessService,
} from '@features/menus/application';
import type {
  DeleteMenuCategoryResponseDto,
  MenuCategoryResponseDto,
} from '@features/menus/application/dtos/output';
import {
  CreateMenuCategoryRequestDto,
  DeleteMenuCategoryResponseSwaggerDto,
  MenuCategoryResponseSwaggerDto,
  UpdateMenuCategoryRequestDto,
} from '@features/menus/presentation/dto';

@ApiTags('Menu Categories')
@Controller({ path: 'menu-categories', version: '1' })
export class MenuCategoriesController {
  constructor(
    private readonly menuCategoryService: MenuCategoryService,
    private readonly accessService: MenusAccessService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('menu-category:read')
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar categorías de menú' })
  @ApiOkResponse({
    type: MenuCategoryResponseSwaggerDto,
    isArray: true,
    description: 'Listado de categorías',
  })
  @ApiQuery({
    name: 'restaurantId',
    required: false,
    description: 'UUID del restaurante para filtrar',
  })
  async findAll(
    @Query('restaurantId') restaurantId?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<MenuCategoryResponseDto[]> {
    if (this.isOwner(user) && !restaurantId) {
      restaurantId = await this.accessService.ensureOwnerRestaurant(
        user.userId,
      );
    }

    if (restaurantId) {
      return this.menuCategoryService.findByRestaurant(restaurantId);
    }

    return this.menuCategoryService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('menu-category:create')
  @ThrottleCreate()
  @ApiBody({ type: CreateMenuCategoryRequestDto })
  @ApiCreatedResponse({
    description: 'Categoría creada',
    type: MenuCategoryResponseSwaggerDto,
  })
  async create(
    @Body() dto: CreateMenuCategoryRequestDto,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<MenuCategoryResponseDto> {
    const payload = await this.mapOwnerRestaurant(dto, user);
    return this.menuCategoryService.create(payload);
  }

  @Patch(':categoryId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('menu-category:update')
  @ThrottleModify()
  @ApiParam({ name: 'categoryId', description: 'UUID de la categoría' })
  @ApiBody({ type: UpdateMenuCategoryRequestDto })
  @ApiOkResponse({
    description: 'Categoría actualizada',
    type: MenuCategoryResponseSwaggerDto,
  })
  async update(
    @Param('categoryId', UUIDPipe) categoryId: string,
    @Body() dto: UpdateMenuCategoryRequestDto,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<MenuCategoryResponseDto> {
    if (this.isOwner(user)) {
      await this.ensureOwnerOwnsCategory(user.userId, categoryId);
    }

    return this.menuCategoryService.update({ ...dto, categoryId });
  }

  @Delete(':categoryId')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @Permissions('menu-category:delete')
  @ThrottleModify()
  @ApiParam({ name: 'categoryId', description: 'UUID de la categoría' })
  @ApiOkResponse({
    description: 'Categoría eliminada',
    type: DeleteMenuCategoryResponseSwaggerDto,
  })
  async delete(
    @Param('categoryId', UUIDPipe) categoryId: string,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<DeleteMenuCategoryResponseDto> {
    if (this.isOwner(user)) {
      await this.ensureOwnerOwnsCategory(user.userId, categoryId);
    }

    return this.menuCategoryService.delete({ categoryId });
  }

  private isOwner(user?: CurrentUserPayload): user is CurrentUserPayload {
    return Boolean(
      user?.roles?.some((role) => role.name === (AuthRoleName.OWNER as string)),
    );
  }

  private async mapOwnerRestaurant(
    dto: CreateMenuCategoryRequestDto,
    user?: CurrentUserPayload,
  ): Promise<CreateMenuCategoryRequestDto> {
    if (!this.isOwner(user)) {
      return dto;
    }
    const restaurantId = await this.accessService.ensureOwnerRestaurant(
      user.userId,
    );
    return { ...dto, restaurantId };
  }

  private async ensureOwnerOwnsCategory(
    ownerId: string,
    categoryId: string,
  ): Promise<void> {
    const restaurantId =
      await this.accessService.ensureOwnerRestaurant(ownerId);
    const category = await this.menuCategoryService.findById(categoryId);
    if (category.restaurantId !== restaurantId) {
      throw new ForbiddenException(
        'No tiene permiso para modificar esta categoría',
      );
    }
  }
}
