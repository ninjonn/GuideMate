import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

// Query parameterek egyszeru szam parsolasa.
const parseNumber = ({ value }: TransformFnParams): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

// Opcionals string mezok trimelese.
const trimOptional = ({ value }: TransformFnParams): string | undefined =>
  typeof value === 'string' ? value.trim() : undefined;

// Admin felhasznalo lista szuro es lapozo parameterei.
export class AdminUserQueryDto {
  // Oldalszam, 1-tol indul.
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(parseNumber)
  oldal?: number;

  // Limit, minimum 1 elem oldalankent.
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(parseNumber)
  limit?: number;

  // Kereses nev vagy email alapjan.
  @IsOptional()
  @IsString()
  @MinLength(1)
  @Transform(trimOptional)
  kereses?: string;

  // Szerepkor szures, admin vagy user.
  @IsOptional()
  @IsIn(['admin', 'user'])
  @Transform(trimOptional)
  szerepkor?: 'admin' | 'user';
}
