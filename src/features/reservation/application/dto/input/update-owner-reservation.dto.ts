import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './create-reservation.dto';

export class UpdateOwnerReservationDto extends PartialType(
  PickType(CreateReservationDto, [
    'reservationDate',
    'reservationTime',
    'numberOfGuests',
  ] as const),
) {}

export type UpdateOwnerReservationCommand = UpdateOwnerReservationDto & {
  reservationId: string;
  ownerId: string;
};
