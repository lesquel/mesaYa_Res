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
} from '@features/reservation/application/dto';
import {
  ReservationService,
  GetReservationAnalyticsUseCase,
} from '@features/reservation/application';
import {
  ReservationAnalyticsRequestDto,
  ReservationAnalyticsResponseDto,
} from '@features/reservation/interface/dto';

@ApiTags('Admin Reservations')
@Controller({ path: 'admin/reservations', version: '1' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationService,
    private readonly getReservationAnalytics: GetReservationAnalyticsUseCase,
  ) {}

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
