import { Transform, type TransformFnParams } from 'class-transformer';
import { IsDateString, IsString, MinLength } from 'class-validator';

// Kotelezo mezok trimelese.
const trimRequired = ({ value }: TransformFnParams): string =>
  typeof value === 'string' ? value.trim() : '';

// Uj program DTO validacio.
export class CreateProgramDto {
  // Program neve kotelezo, minimum 1 karakter.
  @IsString()
  @MinLength(1)
  @Transform(trimRequired)
  nev: string;

  // Napi datum ISO formatumban.
  @IsDateString()
  @Transform(trimRequired)
  nap_datum: string;
}
