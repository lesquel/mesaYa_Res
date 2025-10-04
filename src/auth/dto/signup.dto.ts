import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class SignUpDto {
  @ApiProperty({ example: 'user@example.com', maxLength: 100 })
  @IsEmail()
  @MaxLength(100)
  @trim()
  email: string;

  @ApiProperty({ example: 'John Doe', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @trim()
  name: string;

  @ApiProperty({ example: '0999999999', maxLength: 15 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  @trim()
  phone: string;

  @ApiProperty({
    example: 'StrongP4ss',
    minLength: 8,
    description: 'Al menos 1 mayúscula, 1 minúscula y 1 número',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  // at least 1 upper, 1 lower, 1 number
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  password: string;
}
