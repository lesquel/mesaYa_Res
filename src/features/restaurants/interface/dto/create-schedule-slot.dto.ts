import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const TIME_REGEX = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

export class CreateScheduleSlotDto {
  @ApiProperty({ example: 'Lunch shift', maxLength: 120 })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  summary: string;

  @ApiProperty({ example: 'monday', enum: DAYS })
  @IsString()
  @IsIn(DAYS)
  day: string;

  @ApiProperty({ example: '09:00', pattern: 'HH:mm' })
  @IsString()
  @Matches(TIME_REGEX)
  open: string;

  @ApiProperty({ example: '17:00', pattern: 'HH:mm' })
  @IsString()
  @Matches(TIME_REGEX)
  close: string;
}
