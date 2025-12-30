import { Transform, type TransformFnParams } from 'class-transformer';
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

// Opcionalis mezok trimelese.
const trimOptional = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

// Utazas frissites DTO validacio, minden mezo opcionalis.
export class UpdateUtazasDto {
  // Cim frissitese, ha megadott.
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  cim?: string;

  // Leiras frissitese, ha megadott.
  @IsOptional()
  @IsString()
  @Transform(trimOptional)
  leiras?: string;

  // Kezdo datum frissitese, ha megadott.
  @IsOptional()
  @IsDateString()
  @Transform(trimOptional)
  kezdo_datum?: string;

  // Veg datum frissitese, ha megadott.
  @IsOptional()
  @IsDateString()
  @Transform(trimOptional)
  veg_datum?: string;
}
