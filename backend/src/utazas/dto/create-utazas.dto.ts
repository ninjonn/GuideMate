import { Transform, type TransformFnParams } from 'class-transformer';
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

// Kotelezo mezok trimelese.
const trimRequired = ({ value }: TransformFnParams): string =>
  typeof value === 'string' ? value.trim() : '';

// Opcionalis mezok trimelese.
const trimOptional = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

// Uj utazas letrehozas DTO validacio.
export class CreateUtazasDto {
  // Cim kotelezo, minimum 1 karakter.
  @IsString()
  @MinLength(1)
  @Transform(trimRequired)
  cim: string;

  // Leiras opcionalis, ha megadott akkor string.
  @IsOptional()
  @IsString()
  @Transform(trimOptional)
  leiras?: string;

  // Kezdo datum ISO formatumban.
  @IsDateString()
  @Transform(trimRequired)
  kezdo_datum: string;

  // Veg datum ISO formatumban.
  @IsDateString()
  @Transform(trimRequired)
  veg_datum: string;
}
