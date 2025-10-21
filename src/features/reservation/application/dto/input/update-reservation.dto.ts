import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './create-reservation.dto';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {}

export type UpdateReservationCommand = UpdateReservationDto & {
  reservationId: string;
  userId: string;
};
