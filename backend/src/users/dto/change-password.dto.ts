import { Transform, type TransformFnParams } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

const trimRequired = ({ value }: TransformFnParams): string =>
  typeof value === 'string' ? value.trim() : '';

export class ChangePasswordDto {
  @IsString()
  @MinLength(6)
  @Transform(trimRequired)
  regi_jelszo: string;

  @IsString()
  @MinLength(6)
  @Transform(trimRequired)
  uj_jelszo: string;
}
