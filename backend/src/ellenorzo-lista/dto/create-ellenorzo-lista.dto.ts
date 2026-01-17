import { Transform, type TransformFnParams } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

// Kotelezo mezok trimelese.
const trimRequired = ({ value }: TransformFnParams): string =>
  typeof value === 'string' ? value.trim() : '';

// Uj ellenorzolista DTO validacio.
export class CreateEllenorzoListaDto {
  // Lista neve kotelezo, minimum 1 karakter.
  @IsString()
  @MinLength(1)
  @Transform(trimRequired)
  lista_nev: string;
}
