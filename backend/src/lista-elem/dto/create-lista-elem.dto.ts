import { Transform, type TransformFnParams } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

// Kotelezo mezok trimelese.
const trimRequired = ({ value }: TransformFnParams): string =>
  typeof value === 'string' ? value.trim() : '';

// Uj elem DTO validacio.
export class CreateListaElemDto {
  // Megnevezes kotelezo, minimum 1 karakter.
  @IsString()
  @MinLength(1)
  @Transform(trimRequired)
  megnevezes: string;
}
