import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min, IsDate } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ description: 'Restaurant identifier', format: 'uuid' })
  @IsUUID()
  restaurantId: string;

  @ApiProperty({ description: 'Table identifier', format: 'uuid' })
  @IsUUID()
  tableId: string;

  @ApiProperty({ description: 'Reservation date in ISO 8601 format' })
  @IsDate()
  reservationDate: string;

  @ApiProperty({ description: 'Reservation time in ISO 8601 format' })
  @IsDate()
  reservationTime: string;

  @ApiProperty({ description: 'Number of guests' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  numberOfGuests: number;
}

export type CreateBookingCommand = CreateBookingDto & {
  userId: string;
};
