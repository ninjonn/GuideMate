import { Transform, type TransformFnParams } from 'class-transformer';
import { IsIn, IsString } from 'class-validator';

// Kotelezo mezok trimelese.
const trimRequired = ({ value }: TransformFnParams): string =>
  typeof value === 'string' ? value.trim() : '';

// Admin jogosultsag frissites DTO.
export class UpdateUserRoleDto {
  // A szerepkor admin vagy user lehet.
  @IsString()
  @IsIn(['admin', 'user'])
  @Transform(trimRequired)
  szerepkor: 'admin' | 'user';
}
