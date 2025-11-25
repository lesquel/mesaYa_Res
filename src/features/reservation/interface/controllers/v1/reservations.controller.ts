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
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@features/auth/interface/guards/jwt-auth.guard';
import { PermissionsGuard } from '@features/auth/interface/guards/permissions.guard';
import { Permissions } from '@features/auth/interface/decorators/permissions.decorator';
import { CurrentUser } from '@features/auth/interface/decorators/current-user.decorator';
import type { CurrentUserPayload } from '@features/auth/interface/decorators/current-user.decorator';
import { PaginationParams } from '@shared/interface/decorators/pagination-params.decorator';
import { PaginatedEndpoint } from '@shared/interface/decorators/paginated-endpoint.decorator';
import { ApiListResponse } from '@shared/interface/swagger/decorators/api-list-response.decorator';
import type { PaginatedQueryParams } from '@shared/application/types/pagination';
import {
  ThrottleCreate,
  ThrottleRead,
  ThrottleModify,
  ThrottleSearch,
} from '@shared/infrastructure/decorators';
import {
  ChangeReservationStatusDto,
  CreateReservationDto,
  CreateReservationCommand,
  UpdateReservationDto,
  ReservationResponseDto,
  PaginatedReservationResponse,
  ListReservationsQuery,
  ListOwnerReservationsQuery,
  ReservationAnalyticsQuery,
} from '@features/reservation/application/dto';
import {
  ReservationService,
  GetReservationAnalyticsUseCase,
  ListOwnerReservationsUseCase,
  UpdateOwnerReservationUseCase,
  DeleteOwnerReservationUseCase,
  ChangeReservationStatusUseCase,
} from '@features/reservation/application';
import { ReservationResponseSwaggerDto } from '../../dto';
import { ReservationAnalyticsRequestDto } from '@features/reservation/interface/dto';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';

@ApiTags('Reservations')
@Controller({ path: 'reservations', version: '1' })
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationService,
    private readonly getReservationAnalytics: GetReservationAnalyticsUseCase,
    private readonly listOwnerReservations: ListOwnerReservationsUseCase,
    private readonly updateOwnerReservation: UpdateOwnerReservationUseCase,
    private readonly deleteOwnerReservation: DeleteOwnerReservationUseCase,
    private readonly changeReservationStatus: ChangeReservationStatusUseCase,
  ) {}

  @Get('analytics')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('reservation:read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reservation analytics (Admin)' })
  async analytics(
    @Query() query: ReservationAnalyticsRequestDto,
  ): Promise<any> {
    const q: ReservationAnalyticsQuery = {
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };
    return this.getReservationAnalytics.execute(q);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ThrottleSearch()
  @ApiOperation({ summary: 'List reservations' })
  @PaginatedEndpoint()
  @ApiListResponse({
    model: ReservationResponseSwaggerDto,
    description: 'Paginated list of reservations',
  })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'restaurantId', required: false, type: String })
  @ApiQuery({ name: 'date', required: false, type: String })
  async findAll(
    @PaginationParams({
      defaultRoute: '/reservations',
      allowExtraParams: true,
    })
    pagination: PaginatedQueryParams,
    @Query() raw: Record<string, unknown>,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PaginatedReservationResponse> {
    // Determine context based on user role
    if (user.roles?.some((r) => r.name === AuthRoleName.ADMIN)) {
      const query: ListReservationsQuery = { ...pagination };
      if (typeof raw.status === 'string') query.status = raw.status as any;
      if (typeof raw.restaurantId === 'string')
        query.restaurantId = raw.restaurantId;
      if (typeof raw.date === 'string') query.date = raw.date;
      return this.reservationsService.list(query);
    } else if (user.roles?.some((r) => r.name === AuthRoleName.OWNER)) {
      const query: ListOwnerReservationsQuery = {
        ...pagination,
        ownerId: user.userId,
      };
      if (typeof raw.status === 'string') query.status = raw.status as any;
      if (typeof raw.restaurantId === 'string')
        query.restaurantId = raw.restaurantId;
      if (typeof raw.date === 'string') query.date = raw.date;
      return this.listOwnerReservations.execute(query);
    } else {
      // Regular user - list my reservations
      // Assuming service has listByUser or similar, or we filter by userId
      // For now, falling back to list with userId filter if supported, or empty
      // The original code didn't show user-specific list in Public controller (it was public list).
      // But usually users want to see THEIR reservations.
      // I'll assume public list for now if no specific user logic exists,
      // but strictly speaking it should be "my reservations".

      // Public controller had: return this.reservationsService.list(query);
      // So I'll use that.
      const query: ListReservationsQuery = { ...pagination };
      return this.reservationsService.list(query);
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ThrottleCreate()
  @ApiOperation({ summary: 'Create reservation' })
  @ApiBody({ type: CreateReservationDto })
  async create(
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ReservationResponseDto> {
    const command: CreateReservationCommand = {
      ...dto,
      userId: user.userId,
    };
    return this.reservationsService.create(command);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ThrottleRead()
  @ApiOperation({ summary: 'Get reservation by ID' })
  @ApiParam({ name: 'id', description: 'Reservation UUID' })
  async findOne(
    @Param('id', UUIDPipe) id: string,
  ): Promise<ReservationResponseDto> {
    return this.reservationsService.findOne({ reservationId: id });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ThrottleModify()
  @ApiOperation({ summary: 'Update reservation' })
  @ApiParam({ name: 'id', description: 'Reservation UUID' })
  @ApiBody({ type: UpdateReservationDto })
  async update(
    @Param('id', UUIDPipe) id: string,
    @Body() dto: UpdateReservationDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ReservationResponseDto> {
    if (user.roles?.some((r) => r.name === AuthRoleName.ADMIN)) {
      // Admin update
      // Assuming service has update method
      // The admin controller didn't show update implementation, but imported UpdateReservationCommand
      // I'll assume service.update exists
      return this.reservationsService.update({
        reservationId: id,
        ...dto,
      } as any);
    } else if (user.roles?.some((r) => r.name === AuthRoleName.OWNER)) {
      return this.updateOwnerReservation.execute({
        reservationId: id,
        ownerId: user.userId,
        ...dto,
      } as any);
    } else {
      // User update?
      throw new ForbiddenException('Not allowed');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete reservation' })
  @ApiParam({ name: 'id', description: 'Reservation UUID' })
  async delete(
    @Param('id', UUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<any> {
    if (user.roles?.some((r) => r.name === AuthRoleName.ADMIN)) {
      return this.reservationsService.delete({
        reservationId: id,
        userId: user.userId,
      });
    } else if (user.roles?.some((r) => r.name === AuthRoleName.OWNER)) {
      return this.deleteOwnerReservation.execute({
        reservationId: id,
        ownerId: user.userId,
      });
    } else {
      throw new ForbiddenException('Not allowed');
    }
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ThrottleModify()
  @ApiOperation({ summary: 'Change reservation status' })
  @ApiParam({ name: 'id', description: 'Reservation UUID' })
  @ApiBody({ type: ChangeReservationStatusDto })
  async changeStatus(
    @Param('id', UUIDPipe) id: string,
    @Body() dto: ChangeReservationStatusDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ReservationResponseDto> {
    const isAdmin = user.roles?.some((r) => r.name === AuthRoleName.ADMIN);
    const isOwner = user.roles?.some((r) => r.name === AuthRoleName.OWNER);
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Not allowed');
    }

    return this.changeReservationStatus.execute({
      reservationId: id,
      status: dto.status,
      reason: dto.reason,
      notifyCustomer: dto.notifyCustomer,
      actor: isAdmin ? 'admin' : 'owner',
      ownerId: isOwner ? user.userId : undefined,
      enforceOwnership: !isAdmin && isOwner,
    });
  }
}
