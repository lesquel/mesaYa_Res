import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { RolesGuard } from '@features/auth/interface/guards/roles.guard';
import { Roles } from '@features/auth/interface/decorators/roles.decorator';
import { AuthRoleName } from '@features/auth/domain/entities/auth-role.entity';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '@features/auth/interface/decorators/current-user.decorator';
import { RestaurantScheduleService } from '@features/restaurants/application/services/restaurant-schedule.service';
import {
  CreateScheduleExceptionDto,
  UpdateScheduleExceptionDto,
  ScheduleExceptionResponseDto,
  CreateScheduleSlotDto,
  ScheduleSlotResponseDto,
} from '@features/restaurants/interface/dto';

@ApiTags('Schedules - Restaurant')
@Controller({ path: 'restaurant/schedules', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RestaurantSchedulesController {
  constructor(private readonly scheduleService: RestaurantScheduleService) {}

  @Post('restaurant/:restaurantId')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({
    summary: 'Crear excepción de horario para restaurante (propietario)',
  })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiBody({ type: CreateScheduleExceptionDto })
  @ApiCreatedResponse({
    description: 'Excepción creada',
    type: ScheduleExceptionResponseDto,
  })
  async create(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Body() dto: CreateScheduleExceptionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ScheduleExceptionResponseDto> {
    const rec = await this.scheduleService.createException(
      restaurantId,
      user.userId,
      dto as any,
    );
    return ScheduleExceptionResponseDto.fromRecord(rec);
  }

  @Get('restaurant/:restaurantId')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Listar excepciones de horario (propietario)' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiOkResponse({
    description: 'Lista de excepciones',
    type: ScheduleExceptionResponseDto,
    isArray: true,
  })
  async list(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const rows = await this.scheduleService.listExceptions(
      restaurantId,
      user.userId,
    );
    return rows.map(ScheduleExceptionResponseDto.fromRecord);
  }

  @Get('restaurant/:restaurantId/slots')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Listar horarios base (propietario)' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiOkResponse({
    description: 'Lista de horarios',
    type: ScheduleSlotResponseDto,
    isArray: true,
  })
  async listSlots(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const rows = await this.scheduleService.listSlots(restaurantId, user.userId);
    return rows.map(ScheduleSlotResponseDto.fromRecord);
  }

  @Post('restaurant/:restaurantId/slots')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Crear horario base (propietario)' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiBody({ type: CreateScheduleSlotDto })
  @ApiCreatedResponse({
    description: 'Horario creado',
    type: ScheduleSlotResponseDto,
  })
  async createSlot(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Body() dto: CreateScheduleSlotDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ScheduleSlotResponseDto> {
    const rec = await this.scheduleService.createSlot(restaurantId, user.userId, dto as any);
    return ScheduleSlotResponseDto.fromRecord(rec);
  }

  @Delete('restaurant/:restaurantId/slots/:id')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Eliminar horario base (propietario)' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiParam({ name: 'id', description: 'UUID del horario' })
  @ApiOkResponse({ description: 'Horario eliminado' })
  async deleteSlot(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.deleteSlot(restaurantId, user.userId, id);
    return { ok: true };
  }

  @Patch(':id/restaurant/:restaurantId')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Actualizar excepción de horario (propietario)' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiParam({ name: 'id', description: 'UUID de la excepción' })
  @ApiBody({ type: UpdateScheduleExceptionDto })
  async update(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScheduleExceptionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const rec = await this.scheduleService.updateException(
      restaurantId,
      user.userId,
      id,
      dto as any,
    );
    return ScheduleExceptionResponseDto.fromRecord(rec);
  }

  @Delete(':id/restaurant/:restaurantId')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Eliminar excepción de horario (propietario)' })
  @ApiParam({ name: 'restaurantId', description: 'UUID del restaurante' })
  @ApiParam({ name: 'id', description: 'UUID de la excepción' })
  @ApiOkResponse({ description: 'Eliminada' })
  async remove(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.deleteException(restaurantId, user.userId, id);
    return { ok: true };
  }
}
