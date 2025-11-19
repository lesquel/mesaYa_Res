import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min, IsDate } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ description: 'Restaurant identifier', format: 'uuid' })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ description: 'Table identifier', format: 'uuid' })
  @IsUUID()
  tableId: string;

  @ApiProperty({ description: 'Reservation date in ISO 8601 format' })
  @Type(() => Date)
  @IsDate()
  reservationDate: string;

  @ApiProperty({ description: 'Reservation time in ISO 8601 format' })
  @Type(() => Date)
  @IsDate()
  reservationTime: string;

  @ApiProperty({ description: 'Number of guests' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  numberOfGuests: number;
}

export type CreateReservationCommand = CreateReservationDto & {
  userId: string;
};
