import { Transform, type TransformFnParams } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

// Opcionalis mezok trimelese.
const trimOptional = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

// Elem frissites DTO validacio, minden mezo opcionalis.
export class UpdateListaElemDto {
  // Elem megnevezes frissitese, ha megadott.
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  megnevezes?: string;

  // Kipipalva frissitese, ha megadott.
  @IsOptional()
  @IsBoolean()
  kipipalva?: boolean;
}
