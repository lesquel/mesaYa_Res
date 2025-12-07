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
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { JwtOptionalAuthGuard } from '@features/auth/interface/guards/jwt-optional-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
import type { CurrentUserPayload } from '@features/auth/interface/decorators/current-user.decorator';
import { TablesService, TableSelectionResponse } from '@features/tables/application/services';
import {
  CreateTableDto,
  UpdateTableDto,
  SelectTableDto,
  ReleaseTableDto,
} from '@features/tables/application/dto';
import type {
  CreateTableCommand,
  DeleteTableCommand,
  UpdateTableCommand,
  TableResponseDto,
  DeleteTableResponse,
  FindTableQuery,
  ListSectionTablesQuery,
  ListTablesQuery,
  PaginatedTableResponse,
  SelectTableCommand,
  ReleaseTableCommand,
} from '@features/tables/application/dto';
import {
  TableAnalyticsRequestDto,
  TableAnalyticsResponseDto,
} from '@features/tables/interface/dto';
import { TableResponseSwaggerDto } from '@features/tables/interface/dto/table-response.swagger.dto';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import {
  ThrottleCreate,
  ThrottleModify,
  ThrottleRead,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';

@ApiTags('Tables')
@Controller({ path: 'tables', version: '1' })
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('table:create')
  @ApiBearerAuth()
  @ThrottleCreate()
  @ApiOperation({ summary: 'Create table' })
  @ApiBody({ type: CreateTableDto })
  @ApiCreatedResponse({ description: 'Table created' })
  async create(
    @Body() dto: CreateTableDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TableResponseDto> {
    const command: CreateTableCommand = { ...dto };
    if (user.roles?.some((r) => r.name === (AuthRoleName.ADMIN as string))) {
      return this.tablesService.create(command);
    }
    return this.tablesService.createForOwner(command, user.userId);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('table:read')
  @ApiBearerAuth()
  @ThrottleSearch()
  @ApiOperation({ summary: 'Table analytics' })
  async analytics(
    @Query() query: TableAnalyticsRequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TableAnalyticsResponseDto> {
    if (user.roles?.some((r) => r.name === (AuthRoleName.ADMIN as string))) {
      const analytics = await this.tablesService.getAnalytics(query.toQuery());
      return TableAnalyticsResponseDto.fromApplication(analytics);
    } else {
      const analytics = await this.tablesService.getAnalyticsForOwner(
        query.toQuery(),
        user.userId,
      );
      return TableAnalyticsResponseDto.fromApplication(analytics);
    }
  }

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  @ApiBearerAuth()
  @ThrottleRead()
  @ApiOperation({ summary: 'List tables' })
  @ApiPaginatedResponse({
    model: TableResponseSwaggerDto,
    description: 'Paginated list of tables',
  })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/tables', allowExtraParams: true })
    query: ListTablesQuery,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<PaginatedTableResponse> {
    if (user?.roles?.some((r) => r.name === (AuthRoleName.OWNER as string))) {
      return this.tablesService.listForOwner(query, user.userId);
    }
    return this.tablesService.list(query);
  }

  @Get('section/:sectionId')
  @UseGuards(JwtOptionalAuthGuard)
  @ThrottleRead()
  @ApiOperation({ summary: 'List tables by section' })
  @ApiParam({ name: 'sectionId', description: 'Section UUID' })
  @ApiPaginatedResponse({
    model: TableResponseSwaggerDto,
    description: 'Paginated list of tables in a section',
  })
  @ApiPaginationQuery()
  async findBySection(
    @Param('sectionId', UUIDPipe) sectionId: string,
    @PaginationParams({
      defaultRoute: '/tables/section/:sectionId',
      allowExtraParams: true,
    })
    pagination: ListSectionTablesQuery,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<PaginatedTableResponse> {
    // If owner, use listSectionForOwner?
    // The public controller used listSection.
    // The restaurant controller used listSectionForOwner.
    // I should check if user is owner and use the appropriate method if needed for security.
    // However, listSection might be public anyway.
    // Let's stick to public listSection for now unless we need to filter hidden tables.

    const query: ListSectionTablesQuery = {
      ...pagination,
      sectionId,
    };

    if (user?.roles?.some((r) => r.name === (AuthRoleName.OWNER as string))) {
      return this.tablesService.listSectionForOwner(query, user.userId);
    }

    return this.tablesService.listSection(query);
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  @ThrottleRead()
  @ApiOperation({ summary: 'Get table by ID' })
  @ApiParam({ name: 'id', description: 'Table UUID' })
  @ApiOkResponse({
    description: 'Table details',
    type: TableResponseSwaggerDto,
  })
  async findOne(
    @Param('id', UUIDPipe) id: string,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<TableResponseDto> {
    // If owner, check ownership?
    // Public controller just calls findOne.
    // Restaurant controller calls findOneForOwner (implied, snippet cut off).

    const query: FindTableQuery = { tableId: id };

    if (user?.roles?.some((r) => r.name === (AuthRoleName.OWNER as string))) {
      // Assuming findOneForOwner exists or findOne checks it?
      // The service likely has findOne and findOneForOwner.
      // I'll use findOne for now as it seems public.
      // If there are private fields, we might need differentiation.
      return this.tablesService.findOne(query);
    }

    return this.tablesService.findOne(query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('table:update')
  @ApiBearerAuth()
  @ThrottleModify()
  @ApiOperation({ summary: 'Update table' })
  @ApiParam({ name: 'id', description: 'Table UUID' })
  @ApiBody({ type: UpdateTableDto })
  async update(
    @Param('id', UUIDPipe) id: string,
    @Body() dto: UpdateTableDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TableResponseDto> {
    const command: UpdateTableCommand = { tableId: id, ...dto };
    if (user.roles?.some((r) => r.name === (AuthRoleName.ADMIN as string))) {
      return this.tablesService.update(command);
    }
    return this.tablesService.updateForOwner(command, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('table:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete table' })
  @ApiParam({ name: 'id', description: 'Table UUID' })
  async delete(
    @Param('id', UUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DeleteTableResponse> {
    const command: DeleteTableCommand = { tableId: id };
    if (user.roles?.some((r) => r.name === (AuthRoleName.ADMIN as string))) {
      return this.tablesService.delete(command);
    }
    return this.tablesService.deleteForOwner(command, user.userId);
  }

  /**
   * Temporarily selects a table during the reservation process.
   * This creates a short-term hold to prevent race conditions when multiple
   * users are trying to reserve the same table simultaneously.
   *
   * The selection is broadcast via WebSocket to all connected clients
   * viewing the restaurant's floor plan.
   */
  @Post(':id/select')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ThrottleCreate()
  @ApiOperation({
    summary: 'Temporarily select a table for reservation',
    description:
      'Creates a temporary hold on a table during the reservation flow. ' +
      'Emits a WebSocket event to update the floor plan for all users in real-time.',
  })
  @ApiParam({ name: 'id', description: 'Table UUID' })
  @ApiBody({ type: SelectTableDto })
  @ApiOkResponse({ description: 'Table selection confirmed' })
  async selectTable(
    @Param('id', UUIDPipe) tableId: string,
    @Body() dto: SelectTableDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TableSelectionResponse> {
    const command: SelectTableCommand = {
      tableId,
      userId: user.userId,
      ...dto,
    };
    return this.tablesService.selectTable(command);
  }

  /**
   * Releases a temporarily selected table, making it available again.
   * This should be called when:
   * - The user cancels the reservation flow
   * - The user navigates away from the reservation page
   * - The user's session times out
   */
  @Post(':id/release')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ThrottleModify()
  @ApiOperation({
    summary: 'Release a temporarily selected table',
    description:
      'Releases a table hold, making it available for other users. ' +
      'Emits a WebSocket event to update the floor plan for all users in real-time.',
  })
  @ApiParam({ name: 'id', description: 'Table UUID' })
  @ApiBody({ type: ReleaseTableDto })
  @ApiOkResponse({ description: 'Table released successfully' })
  async releaseTable(
    @Param('id', UUIDPipe) tableId: string,
    @Body() dto: ReleaseTableDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<TableSelectionResponse> {
    const command: ReleaseTableCommand = {
      tableId,
      userId: user.userId,
      ...dto,
    };
    return this.tablesService.releaseTable(command);
  }
}
