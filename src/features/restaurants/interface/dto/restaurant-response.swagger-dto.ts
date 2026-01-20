import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RestaurantLocationSwaggerDto {
  @ApiProperty({ example: 'Av. Amazonas 123, Quito, Ecuador' })
  label!: string;

  @ApiProperty({ example: 'Av. Amazonas 123' })
  address!: string;

  @ApiProperty({ example: 'Quito' })
  city!: string;

  @ApiPropertyOptional({ nullable: true, example: 'Pichincha' })
  province?: string | null;

  @ApiProperty({ example: 'Ecuador' })
  country!: string;

  @ApiPropertyOptional({ nullable: true, example: -0.180653 })
  latitude?: number | null;

  @ApiPropertyOptional({ nullable: true, example: -78.467834 })
  longitude?: number | null;

  @ApiPropertyOptional({ nullable: true })
  placeId?: string | null;
}

export class RestaurantResponseSwaggerDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  description!: string | null;

  @ApiProperty({ type: () => RestaurantLocationSwaggerDto })
  location!: RestaurantLocationSwaggerDto;

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

  @ApiProperty({ enum: ['ACTIVE', 'SUSPENDED', 'ARCHIVED'] })
  status!: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

  @ApiProperty({ required: false, nullable: true, maxLength: 500 })
  adminNote!: string | null;

  @ApiProperty()
  active!: boolean;

  @ApiProperty({ required: false, nullable: true, format: 'uuid' })
  ownerId!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
