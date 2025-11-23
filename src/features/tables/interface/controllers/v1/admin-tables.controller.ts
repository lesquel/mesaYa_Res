import {
  BadRequestException,
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
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
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
  ThrottleRead,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  CreateTableDto,
  UpdateTableDto,
} from '@features/tables/application/dto';
import type {
  CreateTableCommand,
  DeleteTableCommand,
  DeleteTableResponseDto,
  FindTableQuery,
  ListSectionTablesQuery,
  ListTablesQuery,
  PaginatedTableResponse,
  TableResponseDto,
  UpdateTableCommand,
} from '@features/tables/application/dto';
import { TablesService } from '@features/tables/application/services';
import { TableAnalyticsRequestDto } from '@features/tables/interface/dto/table-analytics.request.dto';
import { TableAnalyticsResponseDto } from '@features/tables/interface/dto/table-analytics.response.dto';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@features/auth/interface/decorators/current-user.decorator';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import { TableResponseSwaggerDto } from '@features/tables/interface/dto/table-response.swagger.dto';

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

  @Get()
  @ThrottleRead()
  @Permissions('table:read')
  @ApiOperation({ summary: 'Listar mesas (permiso table:read)' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: TableResponseSwaggerDto,
    description: 'Listado paginado de mesas',
  })
  async list(
    @PaginationParams({
      defaultRoute: '/admin/tables',
      allowExtraParams: true,
    })
    pagination: PaginatedQueryParams,
    @Query('sectionId') sectionId: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PaginatedTableResponse> {
    if (isAdmin(user)) {
      const query: ListTablesQuery = { ...pagination };
      return this.tablesService.list(query);
    }

    const normalizedSection = sectionId?.trim();
    if (!normalizedSection) {
      throw new BadRequestException(
        'sectionId is required for owners to list tables',
      );
    }

    const query: ListSectionTablesQuery = {
      ...pagination,
      sectionId: normalizedSection,
    };

    return this.tablesService.listSectionForOwner(query, user.userId);
  }

  @Get(':id')
  @ThrottleRead()
  @Permissions('table:read')
  @ApiOperation({ summary: 'Obtener mesa por ID (permiso table:read)' })
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  @ApiOkResponse({
    description: 'Detalle de la mesa',
    type: TableResponseSwaggerDto,
  })
  async findOne(
    @Param('id', UUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TableResponseDto> {
    const query: FindTableQuery = { tableId: id };
    if (isAdmin(user)) {
      return this.tablesService.findOne(query);
    }

    return this.tablesService.findOneForOwner(query, user.userId);
  }

  @Patch(':id')
  @ThrottleModify()
  @Permissions('table:update')
  @ApiOperation({ summary: 'Actualizar mesa (permiso table:update)' })
  @ApiParam({ name: 'id', description: 'UUID de la mesa' })
  @ApiBody({ type: UpdateTableDto })
  async update(
    @Param('id', UUIDPipe) id: string,
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
    @Param('id', UUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DeleteTableResponseDto> {
    const command: DeleteTableCommand = { tableId: id };
    if (isAdmin(user)) {
      return this.tablesService.delete(command);
    }

    return this.tablesService.deleteForOwner(command, user.userId);
  }
}
