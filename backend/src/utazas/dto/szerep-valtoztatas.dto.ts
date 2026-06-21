import { IsIn } from 'class-validator';

export class SzerepValtoztatasDto {
  @IsIn(['szerkeszto', 'megtekineto'])
  szerep: 'szerkeszto' | 'megtekineto';
}
