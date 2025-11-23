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

@ApiTags('Schedules')
@Controller({ path: 'restaurants/:restaurantId/schedules', version: '1' })
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RestaurantSchedulesController {
  constructor(private readonly scheduleService: RestaurantScheduleService) {}

  @Post()
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({
    summary: 'Create schedule exception (Owner)',
  })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID' })
  @ApiBody({ type: CreateScheduleExceptionDto })
  @ApiCreatedResponse({
    description: 'Exception created',
    type: ScheduleExceptionResponseDto,
  })
  async create(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
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

  @Get()
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'List schedule exceptions (Owner)' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID' })
  @ApiOkResponse({
    description: 'List of exceptions',
    type: ScheduleExceptionResponseDto,
    isArray: true,
  })
  async findAll(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ScheduleExceptionResponseDto[]> {
    const rows = await this.scheduleService.listExceptions(
      restaurantId,
      user.userId,
    );
    return rows.map(ScheduleExceptionResponseDto.fromRecord);
  }

  @Get('slots')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'List base schedule slots (Owner)' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID' })
  @ApiOkResponse({
    description: 'List of slots',
    type: ScheduleSlotResponseDto,
    isArray: true,
  })
  async listSlots(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const rows = await this.scheduleService.listSlots(
      restaurantId,
      user.userId,
    );
    return rows.map(ScheduleSlotResponseDto.fromRecord);
  }

  @Post('slots')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Create base schedule slot (Owner)' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID' })
  @ApiBody({ type: CreateScheduleSlotDto })
  @ApiCreatedResponse({
    description: 'Slot created',
    type: ScheduleSlotResponseDto,
  })
  async createSlot(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @Body() dto: CreateScheduleSlotDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ScheduleSlotResponseDto> {
    const rec = await this.scheduleService.createSlot(
      restaurantId,
      user.userId,
      dto as any,
    );
    return ScheduleSlotResponseDto.fromRecord(rec);
  }

  @Delete('slots/:id')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Delete base schedule slot (Owner)' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID' })
  @ApiParam({ name: 'id', description: 'Slot UUID' })
  @ApiOkResponse({ description: 'Slot deleted' })
  async deleteSlot(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @Param('id', UUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.deleteSlot(restaurantId, user.userId, id);
    return { ok: true };
  }

  @Patch(':id')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Update schedule exception (Owner)' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID' })
  @ApiParam({ name: 'id', description: 'Exception UUID' })
  @ApiBody({ type: UpdateScheduleExceptionDto })
  async update(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @Param('id', UUIDPipe) id: string,
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

  @Delete(':id')
  @Roles(AuthRoleName.OWNER)
  @ApiOperation({ summary: 'Delete schedule exception (Owner)' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID' })
  @ApiParam({ name: 'id', description: 'Exception UUID' })
  @ApiOkResponse({ description: 'Deleted' })
  async remove(
    @Param('restaurantId', UUIDPipe) restaurantId: string,
    @Param('id', UUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.scheduleService.deleteException(restaurantId, user.userId, id);
    return { ok: true };
  }
}
