import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import {
  RESERVATION_STATUSES,
  ReservationStatus,
} from '../../domain/types/reservation-status.type';

export class ChangeReservationStatusDto {
  @ApiProperty({ enum: RESERVATION_STATUSES })
  @IsIn(RESERVATION_STATUSES)
  status: ReservationStatus;

  @ApiPropertyOptional({ description: 'Reason for the status change' })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Notify the customer about this update' })
  @IsOptional()
  @IsBoolean()
  notifyCustomer?: boolean;
}

export type ChangeReservationStatusCommand = ChangeReservationStatusDto & {
  reservationId: string;
  ownerId?: string;
  actor: 'owner' | 'admin';
  enforceOwnership?: boolean;
};
