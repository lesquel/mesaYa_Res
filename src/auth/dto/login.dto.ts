import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength } from 'class-validator';

const trim = () =>
  Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));

export class LoginDto {
  @IsEmail()
  @MaxLength(100)
  @trim()
  email: string;

  @IsString()
  @MaxLength(100)
  password: string;
}
