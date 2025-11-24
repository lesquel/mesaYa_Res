import { PartialType } from '@nestjs/swagger';
import { CreateScheduleSlotDto } from './create-schedule-slot.dto';

export class UpdateScheduleSlotDto extends PartialType(CreateScheduleSlotDto) {}
