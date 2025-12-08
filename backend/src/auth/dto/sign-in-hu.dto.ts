import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignInHuDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  jelszo: string;
}
