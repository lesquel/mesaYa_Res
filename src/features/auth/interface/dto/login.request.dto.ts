import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class LoginRequestDto {
  @ApiProperty({ example: 'user@example.com', maxLength: 100 })
  @IsEmail()
  @MaxLength(100)
  @trim()
  email: string;

  @ApiProperty({ example: 'StrongP4ss', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  password: string;
}
