import { Transform, type TransformFnParams } from 'class-transformer';
import { IsDateString, IsOptional, IsString, Matches, MinLength } from 'class-validator';

// Kotelezo mezok trimelese.
const trimRequired = ({ value }: TransformFnParams): string =>
  typeof value === 'string' ? value.trim() : '';

// Opcionalis mezok trimelese.
const trimOptional = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

// Uj program DTO validacio.
export class CreateProgramDto {
  // Program neve kotelezo, minimum 1 karakter.
  @IsString()
  @MinLength(1)
  @Transform(trimRequired)
  nev: string;

  // Leiras opcionalis, ha megadott akkor string.
  @IsOptional()
  @IsString()
  @Transform(trimOptional)
  leiras?: string;

  // Napi datum ISO formatumban.
  @IsDateString()
  @Transform(trimRequired)
  nap_datum: string;

  // Kezdo ido HH:MM formatumban.
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  @Transform(trimRequired)
  kezdo_ido: string;

  // Veg ido HH:MM formatumban.
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  @Transform(trimRequired)
  veg_ido: string;
}
