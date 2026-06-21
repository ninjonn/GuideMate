import { IsEmail, IsIn } from 'class-validator';

export class MeghivoDto {
  @IsEmail()
  email: string;

  @IsIn(['szerkeszto', 'megtekineto'])
  szerep: 'szerkeszto' | 'megtekineto';
}
