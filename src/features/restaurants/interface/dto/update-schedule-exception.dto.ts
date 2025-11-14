import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateScheduleExceptionDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string | null;
}
