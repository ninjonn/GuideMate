import { Transform, type TransformFnParams } from 'class-transformer';
import { IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

// Kotelezo mezok trimelese.
const trimRequired = ({ value }: TransformFnParams): string =>
  typeof value === 'string' ? value.trim() : '';

// Opcionalis mezok trimelese.
const trimOptional = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

// Uj foglalas DTO validacio, tipus alapjan ellenorizzuk a mezoket.
export class CreateFoglalasDto {
  // Foglalas tipusa (pl. repulo, szallas).
  @IsString()
  @IsIn(['repulo', 'szallas', 'busz', 'vonat', 'auto'])
  @Transform(trimRequired)
  tipus: 'repulo' | 'szallas' | 'busz' | 'vonat' | 'auto';

  // Repulo: indulasi hely.
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  indulasi_hely?: string;

  // Repulo: erkezesi hely.
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  erkezesi_hely?: string;

  // Repulo: indulasi idopont ISO formatumban.
  @IsOptional()
  @IsDateString()
  @Transform(trimOptional)
  indulasi_ido?: string;

  // Repulo: erkezesi idopont ISO formatumban.
  @IsOptional()
  @IsDateString()
  @Transform(trimOptional)
  erkezesi_ido?: string;

  // Repulo: jaratszam, opcionalis.
  @IsOptional()
  @IsString()
  @Transform(trimOptional)
  jaratszam?: string;

  // Szallas: hely megnevezese.
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  hely?: string;

  // Szallas: cim.
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  cim?: string;

  // Szallas: kezdo datum ISO formatumban.
  @IsOptional()
  @IsDateString()
  @Transform(trimOptional)
  kezdo_datum?: string;

  // Szallas: veg datum ISO formatumban.
  @IsOptional()
  @IsDateString()
  @Transform(trimOptional)
  veg_datum?: string;
}
