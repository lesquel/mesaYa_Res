import { ApiProperty } from '@nestjs/swagger';

export class RestaurantOwnerOptionDto {
  @ApiProperty({ description: 'Identificador del propietario', format: 'uuid' })
  ownerId!: string;

  @ApiProperty({ description: 'Nombre del propietario' })
  name!: string;

  @ApiProperty({ description: 'Correo del propietario' })
  email!: string;

  static fromRaw(raw: {
    ownerId: string;
    name: string;
    email: string;
  }): RestaurantOwnerOptionDto {
    const dto = new RestaurantOwnerOptionDto();
    dto.ownerId = raw.ownerId;
    dto.name = raw.name;
    dto.email = raw.email;
    return dto;
  }

  static fromArray(
    rows: { ownerId: string; name: string; email: string }[],
  ): RestaurantOwnerOptionDto[] {
    return rows.map((row) => RestaurantOwnerOptionDto.fromRaw(row));
  }
}
