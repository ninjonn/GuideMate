import { Transform, type TransformFnParams } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

const trimOptional = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  vezeteknev?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  keresztnev?: string;

  @IsOptional()
  @IsEmail()
  @Transform(trimOptional)
  email?: string;
}
