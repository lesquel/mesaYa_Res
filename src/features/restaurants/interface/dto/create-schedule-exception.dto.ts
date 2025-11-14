import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateScheduleExceptionDto {
  @IsDateString()
  startDate: string; // YYYY-MM-DD

  @IsDateString()
  endDate: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
