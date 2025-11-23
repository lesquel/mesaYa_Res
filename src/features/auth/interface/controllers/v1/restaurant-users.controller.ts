import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UUIDPipe } from '@shared/interface/pipes/uuid.pipe';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import { ThrottleSearch } from '@shared/infrastructure/decorators';
import { GetAuthAnalyticsUseCase } from '@features/auth/application/use-cases/get-auth-analytics.use-case';
import { AuthAnalyticsRequestDto } from '../../dto/auth-analytics.request.dto';
import { AuthAnalyticsResponseDto } from '../../dto/auth-analytics.response.dto';

@ApiTags('Restaurant Users')
@Controller({ path: 'restaurant/users', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RestaurantUsersController {
  constructor(
    private readonly getAuthAnalyticsUseCase: GetAuthAnalyticsUseCase,
  ) {}

  @Get('analytics/restaurant/:restaurantId')
  @ThrottleSearch()
  // Use a restaurant-scoped permission for analytics access
  @Permissions('restaurant:read')
  @ApiOperation({
    summary: 'Indicadores de usuarios para un restaurante (owner/admin)',
  })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiOkResponse({
    description: 'Analytics scoped to restaurant users',
    type: AuthAnalyticsResponseDto,
  })
  async analyticsByRestaurant(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @Query() query: AuthAnalyticsRequestDto,
  ) {
    const q = { ...query.toQuery(), restaurantId };
    const analytics = await this.getAuthAnalyticsUseCase.execute(q);
    return AuthAnalyticsResponseDto.fromApplication(analytics);
  }
}
