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
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
import {
  ThrottleCreate,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  CreateReservationDto,
  CreateReservationCommand,
  UpdateReservationDto,
  UpdateReservationCommand,
  DeleteReservationCommand,
  type ReservationResponseDto,
  type DeleteReservationResponseDto,
  type ListReservationsQuery,
  type PaginatedReservationResponse,
} from '@features/reservation/application/dto';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { ApiPaginatedResponse } from '@shared/interface/swagger/decorators/api-paginated-response.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { ReservationResponseSwaggerDto } from '../../dto';
import { ApiQuery } from '@nestjs/swagger';
import {
  ReservationService,
  GetReservationAnalyticsUseCase,
} from '@features/reservation/application';
import {
  ReservationAnalyticsRequestDto,
  ReservationAnalyticsResponseDto,
} from '@features/reservation/interface/dto';

@ApiTags('Reservations - Admin')
@Controller({ path: 'admin/reservations', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class AdminReservationsController {
  constructor(
    private readonly reservationsService: ReservationService,
    private readonly getReservationAnalytics: GetReservationAnalyticsUseCase,
  ) {}

  @Get()
  @ThrottleSearch()
  @Permissions('reservation:read')
  @ApiOperation({
    summary: 'Listar reservas (permiso reservation:read) (Admin)',
  })
  @PaginatedEndpoint()
  @ApiPaginatedResponse({
    model: ReservationResponseSwaggerDto,
    description: 'Listado paginado de reservas',
  })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'restaurantId', required: false, type: String })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Filter by date YYYY-MM-DD',
  })
  async findAll(
    @PaginationParams({
      defaultRoute: '/admin/reservations',
      allowExtraParams: true,
    })
    pagination: PaginatedQueryParams,
  ): Promise<PaginatedReservationResponse> {
    const query: ListReservationsQuery = { ...pagination } as any;
    // pick possible filters from pagination.route payload - pagination decorator allowed extra params
    // note: PaginationParams returns search and route; extra query params are handled in repository
    return this.reservationsService.list(query);
  }

  @Post()
  @ThrottleCreate()
  @Permissions('reservation:create')
  @ApiOperation({ summary: 'Crear una reserva (permiso reservation:create)' })
  @ApiBody({ type: CreateReservationDto })
  async create(
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: { userId: string },
  ): Promise<ReservationResponseDto> {
    const command: CreateReservationCommand = {
      ...dto,
      userId: user.userId,
    };
    return this.reservationsService.create(command);
  }

  @Get('analytics')
  @ThrottleSearch()
  @Permissions('reservation:read')
  @ApiOperation({ summary: 'Datos analíticos de reservas' })
  async getAnalytics(
    @Query() query: ReservationAnalyticsRequestDto,
  ): Promise<ReservationAnalyticsResponseDto> {
    const analytics = await this.getReservationAnalytics.execute(
      query.toQuery(),
    );
    return ReservationAnalyticsResponseDto.fromApplication(analytics);
  }

  @Patch(':id')
  @ThrottleModify()
  @Permissions('reservation:update')
  @ApiOperation({
    summary: 'Actualizar reserva propia (permiso reservation:update)',
  })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  @ApiBody({ type: UpdateReservationDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReservationDto,
    @CurrentUser() user: { userId: string },
  ): Promise<ReservationResponseDto> {
    const command: UpdateReservationCommand = {
      ...dto,
      reservationId: id,
      userId: user.userId,
    };
    return this.reservationsService.update(command);
  }

  @Delete(':id')
  @ThrottleModify()
  @Permissions('reservation:delete')
  @ApiOperation({
    summary: 'Eliminar reserva propia (permiso reservation:delete)',
  })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { userId: string },
  ): Promise<DeleteReservationResponseDto> {
    const command: DeleteReservationCommand = {
      reservationId: id,
      userId: user.userId,
    };
    return this.reservationsService.delete(command);
  }
}
