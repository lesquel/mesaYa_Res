import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import {
  ThrottleRead,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { GetAuthAnalyticsUseCase } from '@features/auth/application/use-cases/get-auth-analytics.use-case';
import { FindUserByIdUseCase } from '@features/auth/application/use-cases/find-user-by-id.use-case';
import { ListUsersUseCase } from '@features/auth/application/use-cases/list-users.use-case';
import { AuthAnalyticsRequestDto } from '../../dto/auth-analytics.request.dto';
import { PublicAuthAnalyticsResponseDto } from '../../dto/public-auth-analytics.response.dto';
import { AuthUserResponseDto } from '../../dto/auth-user.response.dto';

@ApiTags('Public Users')
@Controller({ path: 'public/users', version: '1' })
export class PublicUsersController {
  constructor(
    private readonly getAuthAnalyticsUseCase: GetAuthAnalyticsUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'List public users (paginated)' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: AuthUserResponseDto,
    description: 'Paginated users list (public view)',
  })
  async list(
    @PaginationParams({ defaultRoute: '/public/users' })
    params: PaginatedQueryParams,
  ) {
    const query = { pagination: params, route: '/public/users' } as any;
    const paginated = await this.listUsersUseCase.execute(query);
    return {
      ...paginated,
      results: paginated.results.map((u) => AuthUserResponseDto.fromDomain(u)),
    };
  }

  @Get('analytics')
  @ThrottleSearch()
  @ApiOperation({
    summary: 'Public user analytics (aggregated, non-sensitive)',
  })
  @ApiOkResponse({
    description: 'Public analytics about users',
    type: PublicAuthAnalyticsResponseDto,
  })
  async analytics(@Query() query: AuthAnalyticsRequestDto) {
    // Reuse the application use-case but map to a reduced public DTO to avoid exposing roles/permissions
    const analytics = await this.getAuthAnalyticsUseCase.execute(
      query.toQuery(),
    );
    return PublicAuthAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener perfil público de un usuario por ID' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiOkResponse({
    description: 'Perfil público del usuario',
    type: AuthUserResponseDto,
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.findUserByIdUseCase.execute(id);
    return user ? AuthUserResponseDto.fromDomain(user) : null;
  }
}
