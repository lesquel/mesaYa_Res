import { ApiProperty } from '@nestjs/swagger';

export class RestaurantResponseSwaggerDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  description!: string | null;

  @ApiProperty()
  location!: string;

  @ApiProperty({ required: false, nullable: true })
  openTime!: string | null;

  @ApiProperty({ required: false, nullable: true })
  closeTime!: string | null;

  @ApiProperty({ type: [String] })
  daysOpen!: string[];

  @ApiProperty()
  totalCapacity!: number;

  @ApiProperty({ format: 'uuid' })
  subscriptionId!: string;

  @ApiProperty({ required: false, nullable: true, format: 'uuid' })
  imageId!: string | null;

  @ApiProperty()
  active!: boolean;

  @ApiProperty({ required: false, nullable: true, format: 'uuid' })
  ownerId!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
