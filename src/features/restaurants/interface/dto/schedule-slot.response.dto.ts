import { ApiProperty } from '@nestjs/swagger';
import { ScheduleSlotRecord } from '@features/restaurants/infrastructure/database/typeorm/repositories/restaurant-schedule-slot.repository';

export class ScheduleSlotResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  restaurantId: string;

  @ApiProperty()
  summary: string;

  @ApiProperty({ example: 'monday' })
  day: string;

  @ApiProperty({ example: '09:00' })
  open: string;

  @ApiProperty({ example: '17:00' })
  close: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  static fromRecord(record: ScheduleSlotRecord): ScheduleSlotResponseDto {
    const dto = new ScheduleSlotResponseDto();
    dto.id = record.id;
    dto.restaurantId = record.restaurantId;
    dto.summary = record.summary;
    dto.day = record.day;
    dto.open = record.open;
    dto.close = record.close;
    dto.createdAt =
      record.createdAt?.toISOString?.() ?? String(record.createdAt);
    dto.updatedAt =
      record.updatedAt?.toISOString?.() ?? String(record.updatedAt);
    return dto;
  }
}
