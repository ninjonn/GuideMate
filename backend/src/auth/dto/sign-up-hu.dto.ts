import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

// Regisztracios DTO validacio es bemenet tisztitas (trim + hossz + email).
export class SignUpHuDto {
  // Vezeteknev kotelezo, space-eket vagjuk.
  @IsString()
  @MinLength(1)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  vezeteknev: string;

  // Keresztnev kotelezo, space-eket vagjuk.
  @IsString()
  @MinLength(1)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : ''))
  keresztnev: string;

  // Email formatum ellenorzese.
  @IsEmail()
  email: string;

  // Jelszo minimum hossz, hash a service-ben keszul.
  @IsString()
  @MinLength(6)
  jelszo: string;
}
