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
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import {
  ThrottleCreate,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  CreateTableDto,
  UpdateTableDto,
} from '@features/tables/application/dto';
import type {
  CreateTableCommand,
  DeleteTableCommand,
  UpdateTableCommand,
  TableResponseDto,
  DeleteTableResponseDto,
} from '@features/tables/application/dto';
import { TablesService } from '@features/tables/application/services';
import { TableAnalyticsRequestDto } from '@features/tables/interface/dto/table-analytics.request.dto';
import { TableAnalyticsResponseDto } from '@features/tables/interface/dto/table-analytics.response.dto';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@features/auth/interface/decorators/current-user.decorator';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';

const hasRole = (
  user: CurrentUserPayload | undefined,
  role: AuthRoleName,
): boolean => user?.roles?.some((item) => item.name === role) ?? false;

const isAdmin = (user: CurrentUserPayload | undefined): boolean =>
  hasRole(user, AuthRoleName.ADMIN);

@ApiTags('Tables - Admin')
@Controller({ path: 'admin/tables', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminTablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @ThrottleCreate()
  @Permissions('table:create')
  @ApiOperation({ summary: 'Crear mesa (permiso table:create)' })
  @ApiBody({ type: CreateTableDto })
  async create(
    @Body() dto: CreateTableDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TableResponseDto> {
    const command: CreateTableCommand = { ...dto };
    if (isAdmin(user)) {
      return this.tablesService.create(command);
    }

    return this.tablesService.createForOwner(command, user.userId);
  }

  @Get('analytics')
  @ThrottleSearch()
  @Permissions('table:read')
  @ApiOperation({ summary: 'Indicadores analíticos de mesas' })
  async analytics(
    @Query() query: TableAnalyticsRequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TableAnalyticsResponseDto> {
    const analytics = isAdmin(user)
      ? await this.tablesService.getAnalytics(query.toQuery())
      : await this.tablesService.getAnalyticsForOwner(
          query.toQuery(),
          user.userId,
        );
    return TableAnalyticsResponseDto.fromApplication(analytics);
  }

  @Patch(':id')
  @ThrottleModify()
  @Permissions('table:update')
  @ApiOperation({ summary: 'Actualizar mesa (permiso table:update)' })
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  @ApiBody({ type: UpdateTableDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTableDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TableResponseDto> {
    const command: UpdateTableCommand = { ...dto, tableId: id };
    if (isAdmin(user)) {
      return this.tablesService.update(command);
    }

    return this.tablesService.updateForOwner(command, user.userId);
  }

  @Delete(':id')
  @ThrottleModify()
  @Permissions('table:delete')
  @ApiOperation({ summary: 'Eliminar mesa (permiso table:delete)' })
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DeleteTableResponseDto> {
    const command: DeleteTableCommand = { tableId: id };
    if (isAdmin(user)) {
      return this.tablesService.delete(command);
    }

    return this.tablesService.deleteForOwner(command, user.userId);
  }
}
