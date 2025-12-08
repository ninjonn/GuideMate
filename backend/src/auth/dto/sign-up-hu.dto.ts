import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpHuDto {
  @IsString()
  @MinLength(1)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  vezeteknev: string;

  @IsString()
  @MinLength(1)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  keresztnev: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  jelszo: string;
}
