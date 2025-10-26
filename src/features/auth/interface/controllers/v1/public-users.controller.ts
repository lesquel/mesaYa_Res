import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  ThrottleRead,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import { GetAuthAnalyticsUseCase } from '@features/auth/application/use-cases/get-auth-analytics.use-case';
import { FindUserByIdUseCase } from '@features/auth/application/use-cases/find-user-by-id.use-case';
import { AuthAnalyticsRequestDto } from '../../dto/auth-analytics.request.dto';
import { AuthAnalyticsResponseDto } from '../../dto/auth-analytics.response.dto';
import { AuthUserResponseDto } from '../../dto/auth-user.response.dto';

@ApiTags('Public Users')
@Controller({ path: 'public/users', version: '1' })
export class PublicUsersController {
  constructor(
    private readonly getAuthAnalyticsUseCase: GetAuthAnalyticsUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  @Get('analytics')
  @ThrottleSearch()
  @ApiOperation({
    summary: 'Public user analytics (aggregated, non-sensitive)',
  })
  @ApiOkResponse({
    description: 'Public analytics about users',
    type: AuthAnalyticsResponseDto,
  })
  async analytics(@Query() query: AuthAnalyticsRequestDto) {
    // We reuse the same application use-case but expose it as public; consumers will only see aggregated data
    const analytics = await this.getAuthAnalyticsUseCase.execute(
      query.toQuery(),
    );
    return AuthAnalyticsResponseDto.fromApplication(analytics);
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
