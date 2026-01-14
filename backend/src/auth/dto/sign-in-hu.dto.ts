import { IsEmail, IsString, MinLength } from 'class-validator';

// Bejelentkezesi DTO validacio (email + jelszo min hossz).
export class SignInHuDto {
  // Email formatum ellenorzese.
  @IsEmail()
  email: string;

  // A jelszo minimum hossza, a valodi ellenorzes a service-ben tortenik.
  @IsString()
  @MinLength(6)
  jelszo: string;
}
