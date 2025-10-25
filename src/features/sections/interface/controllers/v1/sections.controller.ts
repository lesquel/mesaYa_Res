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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import {
  ThrottleCreate,
  ThrottleRead,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  CreateSectionDto,
  SectionsService,
  UpdateSectionDto,
  GetSectionAnalyticsUseCase,
} from '../../../application/index';
import type {
  CreateSectionCommand,
  DeleteSectionCommand,
  DeleteSectionResponseDto,
  FindSectionQuery,
  ListRestaurantSectionsQuery,
  ListSectionsQuery,
  PaginatedSectionResponse,
  SectionResponseDto,
  UpdateSectionCommand,
} from '../../../application/index';
import {
  DeleteSectionResponseSwaggerDto,
  SectionResponseSwaggerDto,
  SectionAnalyticsRequestDto,
  SectionAnalyticsResponseDto,
} from '@features/sections/interface/dto/index';

@ApiTags('Sections')
@Controller({ path: 'section', version: '1' })
export class SectionsController {
  constructor(
    private readonly sectionsService: SectionsService,
    private readonly getSectionAnalytics: GetSectionAnalyticsUseCase,
  ) {}

  @Post()
  @ThrottleCreate()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section:create')
  @ApiOperation({ summary: 'Crear sección (permiso section:create)' })
  @ApiBearerAuth()
  @ApiBody({ type: CreateSectionDto })
  @ApiCreatedResponse({
    description: 'Sección creada correctamente',
    type: SectionResponseSwaggerDto,
  })
  async create(@Body() dto: CreateSectionDto): Promise<SectionResponseDto> {
    const command: CreateSectionCommand = { ...dto };
    return this.sectionsService.create(command);
  }

  @Get('restaurant/:restaurantId')
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar secciones por restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiPaginationQuery()
  @ApiPaginatedResponse({
    model: SectionResponseSwaggerDto,
    description: 'Listado paginado de secciones por restaurante',
  })
  async findByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @PaginationParams({ defaultRoute: '/section/restaurant' })
    pagination: ListSectionsQuery,
  ): Promise<PaginatedSectionResponse> {
    const query: ListRestaurantSectionsQuery = {
      ...pagination,
      restaurantId,
    };
    return this.sectionsService.listByRestaurant(query);
  }

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar secciones (paginado)' })
  @ApiPaginationQuery()
  @ApiPaginatedResponse({
    model: SectionResponseSwaggerDto,
    description: 'Listado paginado de secciones',
  })
  async findAll(
    @PaginationParams({ defaultRoute: '/section' })
    query: ListSectionsQuery,
  ): Promise<PaginatedSectionResponse> {
    return this.sectionsService.list(query);
  }

  @Get('analytics')
  @ThrottleSearch()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section:read')
  @ApiOperation({ summary: 'Indicadores analíticos de secciones' })
  @ApiBearerAuth()
  async analytics(
    @Query() query: SectionAnalyticsRequestDto,
  ): Promise<SectionAnalyticsResponseDto> {
    const analytics = await this.getSectionAnalytics.execute(query.toQuery());
    return SectionAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener una sección por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  @ApiOkResponse({
    description: 'Detalle de la sección',
    type: SectionResponseSwaggerDto,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SectionResponseDto> {
    const query: FindSectionQuery = { sectionId: id };
    return this.sectionsService.findOne(query);
  }

  @Patch(':id')
  @ThrottleModify()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section:update')
  @ApiOperation({ summary: 'Actualizar sección (permiso section:update)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  @ApiBody({ type: UpdateSectionDto })
  @ApiOkResponse({
    description: 'Sección actualizada correctamente',
    type: SectionResponseSwaggerDto,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSectionDto,
  ): Promise<SectionResponseDto> {
    const command: UpdateSectionCommand = {
      sectionId: id,
      ...dto,
    };
    return this.sectionsService.update(command);
  }

  @Delete(':id')
  @ThrottleModify()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section:delete')
  @ApiOperation({ summary: 'Eliminar sección (permiso section:delete)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'UUID de la sección' })
  @ApiOkResponse({
    description: 'Sección eliminada correctamente',
    type: DeleteSectionResponseSwaggerDto,
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeleteSectionResponseDto> {
    const command: DeleteSectionCommand = { sectionId: id };
    return this.sectionsService.delete(command);
  }
}
