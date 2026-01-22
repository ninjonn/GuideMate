import { Transform, type TransformFnParams } from 'class-transformer';
import { IsDateString, IsOptional, IsString, Matches, MinLength } from 'class-validator';

// Opcionalis mezok trimelese.
const trimOptional = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

// Program frissites DTO validacio, minden mezo opcionalis.
export class UpdateProgramDto {
  // Program nev frissitese, ha megadott.
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  nev?: string;

  // Leiras frissitese, ha megadott.
  @IsOptional()
  @IsString()
  @Transform(trimOptional)
  leiras?: string;

  // Napi datum frissitese, ha megadott.
  @IsOptional()
  @IsDateString()
  @Transform(trimOptional)
  nap_datum?: string;

  // Kezdo ido HH:MM formatumban.
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  @Transform(trimOptional)
  kezdo_ido?: string;

  // Veg ido HH:MM formatumban.
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  @Transform(trimOptional)
  veg_ido?: string;
}
