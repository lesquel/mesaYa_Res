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
import { ApiPaginationQuery } from '@shared/interface/swagger/decorators/api-pagination-query.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import {
  ThrottleCreate,
  ThrottleRead,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  CreateReservationDto,
  CreateReservationCommand,
  UpdateReservationDto,
  UpdateReservationCommand,
  FindReservationQuery,
  DeleteReservationCommand,
  type ListReservationsQuery,
  type ListRestaurantReservationsQuery,
  type ReservationResponseDto,
  type PaginatedReservationResponse,
  type DeleteReservationResponseDto,
} from '@features/reservation/application/dto';
import {
  ReservationService,
  GetReservationAnalyticsUseCase,
} from '@features/reservation/application';
import {
  ReservationAnalyticsRequestDto,
  ReservationAnalyticsResponseDto,
} from '@features/reservation/interface/dto';

@ApiTags('Reservations')
@Controller({ path: 'reservations', version: '1' })
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationService,
    private readonly getReservationAnalytics: GetReservationAnalyticsUseCase,
  ) {}

  @Post()
  @ThrottleCreate()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('reservation:create')
  @ApiOperation({ summary: 'Crear una reserva (permiso reservation:create)' })
  @ApiBearerAuth()
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

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar reservas (paginado)' })
  @ApiPaginationQuery()
  async findAll(
    @PaginationParams({ defaultRoute: '/reservations' })
    query: ListReservationsQuery,
  ): Promise<PaginatedReservationResponse> {
    return this.reservationsService.list(query);
  }

  @Get('restaurant/:restaurantId')
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar reservas por restaurante' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiPaginationQuery()
  async findByRestaurant(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @PaginationParams({ defaultRoute: '/reservations/restaurant' })
    pagination: ListReservationsQuery,
  ): Promise<PaginatedReservationResponse> {
    const query: ListRestaurantReservationsQuery = {
      restaurantId,
      ...pagination,
    };
    return this.reservationsService.listByRestaurant(query);
  }

  @Get('analytics')
  @ThrottleSearch()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('reservation:read')
  @ApiOperation({ summary: 'Datos analíticos de reservas' })
  @ApiBearerAuth()
  async getAnalytics(
    @Query() query: ReservationAnalyticsRequestDto,
  ): Promise<ReservationAnalyticsResponseDto> {
    const analytics = await this.getReservationAnalytics.execute(
      query.toQuery(),
    );
    return ReservationAnalyticsResponseDto.fromApplication(analytics);
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener una reserva por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ReservationResponseDto> {
    const query: FindReservationQuery = { reservationId: id };
    return this.reservationsService.findOne(query);
  }

  @Patch(':id')
  @ThrottleModify()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('reservation:update')
  @ApiOperation({
    summary: 'Actualizar reserva propia (permiso reservation:update)',
  })
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('reservation:delete')
  @ApiOperation({
    summary: 'Eliminar reserva propia (permiso reservation:delete)',
  })
  @ApiBearerAuth()
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
