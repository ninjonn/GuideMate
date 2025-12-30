import { Transform, type TransformFnParams } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

// Kotelezo mezok trimelese.
const trimRequired = ({ value }: TransformFnParams): string =>
  typeof value === 'string' ? value.trim() : '';

// Jelszocsere DTO validacio: string + minimum hossz.
export class ChangePasswordDto {
  // A regi jelszo kotelezo, minimalis hosszal.
  @IsString()
  @MinLength(6)
  @Transform(trimRequired)
  regi_jelszo: string;

  // Az uj jelszo kotelezo, minimalis hosszal.
  @IsString()
  @MinLength(6)
  @Transform(trimRequired)
  uj_jelszo: string;
}
