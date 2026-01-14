import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

// Query parameterek egyszeru szam parsolasa.
const parseNumber = ({ value }: TransformFnParams): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

// Utazas lista szures es lapozas alap validacioval.
export class UtazasQueryDto {
  // Statusz szures: aktiv/lezart/torolt.
  @IsOptional()
  @IsIn(['aktiv', 'lezart', 'torolt'])
  statusz?: 'aktiv' | 'lezart' | 'torolt';

  // Rendezes: datum vagy nev.
  @IsOptional()
  @IsIn(['datum', 'nev'])
  rendez?: 'datum' | 'nev';

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
}
