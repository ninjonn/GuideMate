import { Transform, type TransformFnParams } from 'class-transformer';
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

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

  // Napi datum frissitese, ha megadott.
  @IsOptional()
  @IsDateString()
  @Transform(trimOptional)
  nap_datum?: string;
}
