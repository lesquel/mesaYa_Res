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
  @IsEmail()
  @MaxLength(100)
  @trim()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @trim()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  @trim()
  phone: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  // at least 1 upper, 1 lower, 1 number
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  password: string;
}
