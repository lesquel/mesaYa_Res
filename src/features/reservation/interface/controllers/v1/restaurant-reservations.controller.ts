import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UUIDPipe } from '@shared/interface/pipes/uuid.pipe';
import { isUUID } from 'class-validator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { RolesGuard } from '@features/auth/interface/guards/roles.guard';
import { Roles } from '@features/auth/interface/decorators/roles.decorator';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@features/auth/interface/decorators/current-user.decorator';
import {
  ThrottleModify,
  ThrottleRead,
} from '@shared/infrastructure/decorators';
import {
  ListOwnerReservationsQuery,
  PaginatedReservationResponse,
  ReservationResponseDto,
  DeleteReservationResponseDto,
  UpdateOwnerReservationDto,
  UpdateOwnerReservationCommand,
  DeleteOwnerReservationCommand,
} from '@features/reservation/application/dto';
import {
  ListOwnerReservationsUseCase,
  ReservationService,
  UpdateOwnerReservationUseCase,
  DeleteOwnerReservationUseCase,
} from '@features/reservation/application';
import { ReservationOwnerAccessService } from '@features/reservation/application/services';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { ApiListResponse } from '@shared/interface/swagger/decorators/api-list-response.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import { ReservationResponseSwaggerDto } from '../../dto';

@ApiTags('Reservations - Restaurant')
@Controller({ path: 'restaurant/reservations', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AuthRoleName.OWNER)
@ApiBearerAuth()
export class RestaurantReservationsController {
  constructor(
    private readonly listOwnerReservations: ListOwnerReservationsUseCase,
    private readonly reservationService: ReservationService,
    private readonly updateOwnerReservation: UpdateOwnerReservationUseCase,
    private readonly deleteOwnerReservation: DeleteOwnerReservationUseCase,
    private readonly ownerAccess: ReservationOwnerAccessService,
  ) {}

  @Get()
  @ThrottleRead()
  @ApiOperation({ summary: 'Listar reservas del propietario (paginado)' })
  @PaginatedEndpoint()
  @ApiListResponse({
    model: ReservationResponseSwaggerDto,
    description: 'Listado paginado de reservas del propietario',
  })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'restaurantId', required: false, type: String })
  @ApiQuery({
    name: 'date',
    required: false,
    type: String,
    description: 'Filter by date YYYY-MM-DD',
  })
  async list(
    @PaginationParams({
      defaultRoute: '/restaurant/reservations',
      allowExtraParams: true,
    })
    pagination: PaginatedQueryParams,
    @Query() raw: Record<string, unknown>,
    @Query('restaurantId') restaurantIdParam: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PaginatedReservationResponse> {
    const query: ListOwnerReservationsQuery = {
      ...pagination,
      ownerId: user.userId,
    };

    if (typeof raw.status === 'string') {
      query.status = raw.status as ListOwnerReservationsQuery['status'];
    }

    const restaurantId = parseRestaurantIdFilter(restaurantIdParam ?? raw.restaurantId);
    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    if (typeof raw.date === 'string') {
      query.date = raw.date;
    }

    return this.listOwnerReservations.execute(query);
  }

  @Get(':id')
  @ThrottleRead()
  @ApiOperation({ summary: 'Obtener una reserva propia por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  async findOne(
    @Param('id', UUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ReservationResponseDto> {
    await this.ownerAccess.assertReservationOwnership(id, user.userId);
    return this.reservationService.findOne({ reservationId: id });
  }

  @Patch(':id')
  @ThrottleModify()
  @ApiOperation({ summary: 'Actualizar una reserva propia por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  @ApiBody({ type: UpdateOwnerReservationDto })
  async update(
    @Param('id', UUIDPipe) id: string,
    @Body() dto: UpdateOwnerReservationDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ReservationResponseDto> {
    const command: UpdateOwnerReservationCommand = {
      ...dto,
      reservationId: id,
      ownerId: user.userId,
    };
    return this.updateOwnerReservation.execute(command);
  }

  @Delete(':id')
  @ThrottleModify()
  @ApiOperation({ summary: 'Eliminar una reserva propia por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la reserva' })
  async remove(
    @Param('id', UUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<DeleteReservationResponseDto> {
    const command: DeleteOwnerReservationCommand = {
      reservationId: id,
      ownerId: user.userId,
    };
    return this.deleteOwnerReservation.execute(command);
  }
}

function parseRestaurantIdFilter(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    value = value[0];
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  // Allow any UUID version (v1-v8)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(trimmed)) {
    throw new BadRequestException('restaurantId must be a valid UUID');
  }

  return trimmed;
}
