import {
  BadRequestException,
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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@features/auth/interface/decorators/current-user.decorator';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import {
  ThrottleCreate,
  ThrottleModify,
  ThrottleRead,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  CreateSectionDto,
  SectionsService,
  UpdateSectionDto,
} from '../../../application';
import type {
  CreateSectionCommand,
  DeleteSectionCommand,
  DeleteSectionResponseDto,
  FindSectionQuery,
  ListRestaurantSectionsQuery,
  ListSectionsQuery,
  PaginatedSectionResponse,
  UpdateSectionCommand,
  SectionResponseDto,
} from '../../../application';
import {
  DeleteSectionResponseSwaggerDto,
  SectionResponseSwaggerDto,
  SectionAnalyticsRequestDto,
  SectionAnalyticsResponseDto,
} from '@features/sections/interface/dto';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';

const hasRole = (
  user: CurrentUserPayload | undefined,
  role: AuthRoleName,
): boolean => user?.roles?.some((item) => item.name === role) ?? false;

const isAdmin = (user: CurrentUserPayload | undefined): boolean =>
  hasRole(user, AuthRoleName.ADMIN);

@ApiTags('Sections - Admin')
@Controller({ path: 'admin/sections', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminSectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @ThrottleCreate()
  @Permissions('section:create')
  @ApiOperation({ summary: 'Crear sección (permiso section:create)' })
  @ApiBody({ type: CreateSectionDto })
  @ApiCreatedResponse({
    description: 'Sección creada correctamente',
    type: SectionResponseSwaggerDto,
  })
  async create(
    @Body() dto: CreateSectionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SectionResponseDto> {
    const command: CreateSectionCommand = { ...dto };
    if (isAdmin(user)) {
      return this.sectionsService.create(command);
    }

    return this.sectionsService.createForOwner(command, user.userId);
  }

  @Get()
  @ThrottleRead()
  @Permissions('section:read')
  @ApiOperation({ summary: 'Listar secciones (permiso section:read)' })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: SectionResponseSwaggerDto,
    description: 'Listado paginado de secciones',
  })
  async findAll(
    @PaginationParams({
      defaultRoute: '/admin/sections',
      allowExtraParams: true,
    })
    pagination: PaginatedQueryParams,
    @Query('restaurantId') restaurantId: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PaginatedSectionResponse> {
    if (isAdmin(user)) {
      const query: ListSectionsQuery = { ...pagination };
      return this.sectionsService.list(query);
    }

    const normalizedRestaurant = restaurantId?.trim();
    if (!normalizedRestaurant) {
      throw new BadRequestException(
        'restaurantId is required for owners to list sections',
      );
    }

    const query: ListRestaurantSectionsQuery = {
      ...pagination,
      restaurantId: normalizedRestaurant,
    };

    return this.sectionsService.listByRestaurantForOwner(query, user.userId);
  }

  @Get('analytics')
  @ThrottleSearch()
  @Permissions('section:read')
  @ApiOperation({ summary: 'Indicadores analíticos de secciones' })
  async analytics(
    @Query() query: SectionAnalyticsRequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SectionAnalyticsResponseDto> {
    const analytics = isAdmin(user)
      ? await this.sectionsService.getAnalytics(query.toQuery())
      : await this.sectionsService.getAnalyticsForOwner(
          query.toQuery(),
          user.userId,
        );
    return SectionAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get(':id')
  @ThrottleRead()
  @Permissions('section:read')
  @ApiOperation({ summary: 'Obtener sección por ID (permiso section:read)' })
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  @ApiOkResponse({
    description: 'Detalle de la sección',
    type: SectionResponseSwaggerDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SectionResponseDto> {
    const query: FindSectionQuery = { sectionId: id };
    if (isAdmin(user)) {
      return this.sectionsService.findOne(query);
    }

    return this.sectionsService.findOneForOwner(query, user.userId);
  }

  @Patch(':id')
  @ThrottleModify()
  @Permissions('section:update')
  @ApiOperation({ summary: 'Actualizar sección (permiso section:update)' })
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  @ApiBody({ type: UpdateSectionDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSectionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SectionResponseDto> {
    const command: UpdateSectionCommand = {
      sectionId: id,
      ...dto,
    };
    if (isAdmin(user)) {
      return this.sectionsService.update(command);
    }

    return this.sectionsService.updateForOwner(command, user.userId);
  }

  @Delete(':id')
  @ThrottleModify()
  @Permissions('section:delete')
  @ApiOperation({ summary: 'Eliminar sección (permiso section:delete)' })
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  @ApiOkResponse({
    description: 'Sección eliminada correctamente',
    type: DeleteSectionResponseSwaggerDto,
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DeleteSectionResponseDto> {
    const command: DeleteSectionCommand = { sectionId: id };
    if (isAdmin(user)) {
      return this.sectionsService.delete(command);
    }

    return this.sectionsService.deleteForOwner(command, user.userId);
  }
}
