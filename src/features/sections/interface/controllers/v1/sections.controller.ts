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
  ForbiddenException,
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
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import { RolesGuard } from '@features/auth/interface/guards/roles.guard';
import { Roles } from '@features/auth/interface/decorators/roles.decorator';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
import type { CurrentUserPayload } from '@features/auth/interface/decorators/current-user.decorator';
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
  SectionResponseSwaggerDto,
  SectionAnalyticsRequestDto,
  SectionAnalyticsResponseDto,
} from '@features/sections/interface/dto';
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import {
  ThrottleCreate,
  ThrottleModify,
  ThrottleRead,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';

@ApiTags('Sections')
@Controller({ path: 'sections', version: '1' })
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section:create')
  @ApiBearerAuth()
  @ThrottleCreate()
  @ApiOperation({ summary: 'Create section' })
  @ApiBody({ type: CreateSectionDto })
  @ApiCreatedResponse({
    description: 'Section created',
    type: SectionResponseSwaggerDto,
  })
  async create(
    @Body() dto: CreateSectionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SectionResponseDto> {
    const command: CreateSectionCommand = { ...dto };
    if (user.roles?.some((r) => r.name === AuthRoleName.ADMIN)) {
      return this.sectionsService.create(command);
    }
    return this.sectionsService.createForOwner(command, user.userId);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section:read')
  @ApiBearerAuth()
  @ThrottleSearch()
  @ApiOperation({ summary: 'Section analytics' })
  async analytics(
    @Query() query: SectionAnalyticsRequestDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SectionAnalyticsResponseDto> {
    if (user.roles?.some((r) => r.name === AuthRoleName.ADMIN)) {
      const analytics = await this.sectionsService.getAnalytics(
        query.toQuery(),
      );
      return SectionAnalyticsResponseDto.fromApplication(analytics);
    } else {
      const analytics = await this.sectionsService.getAnalyticsForOwner(
        query.toQuery(),
        user.userId,
      );
      return SectionAnalyticsResponseDto.fromApplication(analytics);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ThrottleRead()
  @ApiOperation({ summary: 'List sections' })
  @ApiPaginatedResponse({
    model: SectionResponseSwaggerDto,
    description: 'Paginated list of sections',
  })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/sections', allowExtraParams: true })
    query: ListSectionsQuery,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PaginatedSectionResponse> {
    if (user.roles?.some((r) => r.name === AuthRoleName.OWNER)) {
      return this.sectionsService.listForOwner(query, user.userId);
    }
    return this.sectionsService.list(query);
  }

  @Get('restaurant/:restaurantId')
  @ThrottleRead()
  @ApiOperation({ summary: 'List sections by restaurant' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID' })
  @ApiPaginatedResponse({
    model: SectionResponseSwaggerDto,
    description: 'Paginated list of sections by restaurant',
  })
  @ApiPaginationQuery()
  async findByRestaurant(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @PaginationParams({
      defaultRoute: '/sections/restaurant/:restaurantId',
      allowExtraParams: true,
    })
    pagination: ListRestaurantSectionsQuery,
    @CurrentUser() user?: CurrentUserPayload,
  ): Promise<PaginatedSectionResponse> {
    const query: ListRestaurantSectionsQuery = {
      ...pagination,
      restaurantId,
    };

    if (user && user.roles?.some((r) => r.name === AuthRoleName.OWNER)) {
      return this.sectionsService.listByRestaurantForOwner(query, user.userId);
    }

    return this.sectionsService.listByRestaurant(query);
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Get section by ID' })
  @ApiParam({ name: 'id', description: 'Section UUID' })
  @ApiOkResponse({
    description: 'Section details',
    type: SectionResponseSwaggerDto,
  })
  async findOne(
    @Param('id', UUIDPipe) id: string,
  ): Promise<SectionResponseDto> {
    const query: FindSectionQuery = { sectionId: id };
    return this.sectionsService.findOne(query);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section:update')
  @ApiBearerAuth()
  @ThrottleModify()
  @ApiOperation({ summary: 'Update section' })
  @ApiParam({ name: 'id', description: 'Section UUID' })
  @ApiBody({ type: UpdateSectionDto })
  async update(
    @Param('id', UUIDPipe) id: string,
    @Body() dto: UpdateSectionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SectionResponseDto> {
    const command: UpdateSectionCommand = { sectionId: id, ...dto };
    if (user.roles?.some((r) => r.name === AuthRoleName.ADMIN)) {
      return this.sectionsService.update(command);
    }
    return this.sectionsService.updateForOwner(command, user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('section:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete section' })
  @ApiParam({ name: 'id', description: 'Section UUID' })
  async delete(
    @Param('id', UUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<any> {
    const command: DeleteSectionCommand = { sectionId: id };
    if (user.roles?.some((r) => r.name === AuthRoleName.ADMIN)) {
      return this.sectionsService.delete(command);
    }
    return this.sectionsService.deleteForOwner(command, user.userId);
  }
}
