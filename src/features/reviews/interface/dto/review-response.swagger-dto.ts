import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseSwaggerDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  restaurantId!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty({ nullable: true, required: false, description: 'Full name of the reviewer' })
  userName!: string | null;

  @ApiProperty()
  rating!: number;

  @ApiProperty({ nullable: true, required: false })
  comment!: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
