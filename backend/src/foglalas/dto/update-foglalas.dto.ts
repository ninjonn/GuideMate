import { Transform, type TransformFnParams } from 'class-transformer';
import { IsDateString, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

// Opcionalis mezok trimelese.
const trimOptional = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

// Foglalas frissites DTO validacio, minden mezo opcionalis.
export class UpdateFoglalasDto {
  // Foglalas tipusa, ha megadott.
  @IsOptional()
  @IsString()
  @IsIn(['repulo', 'szallas', 'busz', 'vonat'])
  @Transform(trimOptional)
  tipus?: 'repulo' | 'szallas' | 'busz' | 'vonat';

  // Repulo: indulasi hely frissitese.
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  indulasi_hely?: string;

  // Repulo: erkezesi hely frissitese.
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  erkezesi_hely?: string;

  // Repulo: indulasi idopont frissitese.
  @IsOptional()
  @IsDateString()
  @Transform(trimOptional)
  indulasi_ido?: string;

  // Repulo: erkezesi idopont frissitese.
  @IsOptional()
  @IsDateString()
  @Transform(trimOptional)
  erkezesi_ido?: string;

  // Repulo: jaratszam frissitese.
  @IsOptional()
  @IsString()
  @Transform(trimOptional)
  jaratszam?: string;

  // Szallas: hely frissitese.
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  hely?: string;

  // Szallas: cim frissitese.
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  cim?: string;

  // Szallas: kezdo datum frissitese.
  @IsOptional()
  @IsDateString()
  @Transform(trimOptional)
  kezdo_datum?: string;

  // Szallas: veg datum frissitese.
  @IsOptional()
  @IsDateString()
  @Transform(trimOptional)
  veg_datum?: string;
}
