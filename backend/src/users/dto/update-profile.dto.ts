import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

// Opcionalis mezok trimelese.
const trimOptional = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

// Profil modositas DTO validacio: email format + minimalis hossz.
export class UpdateProfileDto {
  // Vezeteknev opcionalis, ures string nem lehet.
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  vezeteknev?: string;

  // Keresztnev opcionalis, ures string nem lehet.
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  keresztnev?: string;

  // Email opcionalis, formatum ellenorzessel.
  @IsOptional()
  @IsEmail()
  @Transform(trimOptional)
  email?: string;
}
