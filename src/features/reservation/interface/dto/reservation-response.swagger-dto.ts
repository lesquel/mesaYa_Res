import { ApiProperty } from '@nestjs/swagger';

export class ReservationResponseSwaggerDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  restaurantId!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty({ format: 'uuid' })
  tableId!: string;

  @ApiProperty({ type: String, description: 'Fecha de la reserva (ISO 8601 date)' })
  reservationDate!: string;

  @ApiProperty({ type: String, description: 'Hora de la reserva (ISO 8601 time)' })
  reservationTime!: string;

  @ApiProperty()
  numberOfGuests!: number;

  @ApiProperty({ enum: ['PENDING', 'CONFIRMED', 'CANCELLED'] })
  status!: 'PENDING' | 'CONFIRMED' | 'CANCELLED';

  @ApiProperty({ type: String })
  createdAt!: string;

  @ApiProperty({ type: String })
  updatedAt!: string;
}
