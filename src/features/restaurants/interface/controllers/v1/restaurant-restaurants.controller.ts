import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { RolesGuard } from '@features/auth/interface/guards/roles.guard';
import { Roles } from '@features/auth/interface/decorators/roles.decorator';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import { CurrentUser, type CurrentUserPayload } from '@features/auth/interface/decorators/current-user.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { RestaurantsService } from '@features/restaurants/application';
import { UpdateRestaurantDto } from '@features/restaurants/application/dto/input/update-restaurant.dto';
import type { PaginatedRestaurantResponse, RestaurantResponseDto, ListOwnerRestaurantsQuery } from '@features/restaurants/application';

@ApiTags('Restaurants - Restaurant')
@Controller({ path: 'restaurant', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RestaurantRestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get('me')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Listar mis restaurantes (propietario)' })
  @ApiPaginationQuery()
  async findMine(
    @PaginationParams({ defaultRoute: '/restaurant/me' }) pagination: ListOwnerRestaurantsQuery,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PaginatedRestaurantResponse> {
    const query: ListOwnerRestaurantsQuery = { ...pagination, ownerId: user.userId };
    return this.restaurantsService.listByOwner(query);
  }

  @Get(':id')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Obtener restaurante por ID (propietario)' })
  @ApiParam({ name: 'id', description: 'UUID del restaurante' })
  @ApiOkResponse({ description: 'Restaurante encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: CurrentUserPayload): Promise<RestaurantResponseDto> {
    const restaurant = await this.restaurantsService.findOne({ restaurantId: id });
    if (restaurant.ownerId !== user.userId) {
      throw new Error('Restaurant does not belong to authenticated owner');
    }
    return restaurant;
  }

  @Patch(':id')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Actualizar restaurante (propietario)' })
  @ApiParam({ name: 'id', description: 'UUID del restaurante' })
  @ApiBody({ type: UpdateRestaurantDto })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRestaurantDto, @CurrentUser() user: CurrentUserPayload): Promise<RestaurantResponseDto> {
    const command = { restaurantId: id, ownerId: user.userId, ...dto };
    return this.restaurantsService.update(command as any);
  }
}
