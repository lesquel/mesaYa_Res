import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { ThrottleRead } from '@shared/infrastructure/decorators';
import {
  ListOwnerReservationsQuery,
  PaginatedReservationResponse,
  ReservationResponseDto,
} from '@features/reservation/application/dto';
import {
  ListOwnerReservationsUseCase,
  ReservationService,
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
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PaginatedReservationResponse> {
    const query: ListOwnerReservationsQuery = {
      ...pagination,
      ownerId: user.userId,
    };

    if (typeof raw.status === 'string') {
      query.status = raw.status as ListOwnerReservationsQuery['status'];
    }

    if (typeof raw.restaurantId === 'string') {
      query.restaurantId = raw.restaurantId;
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
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ReservationResponseDto> {
    await this.ownerAccess.assertReservationOwnership(id, user.userId);
    return this.reservationService.findOne({ reservationId: id });
  }
}
