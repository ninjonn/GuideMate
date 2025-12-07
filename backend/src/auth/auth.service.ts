import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signUp(dto: SignUpDto) {
    const existing = await this.usersService.findOneByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Már van ilyen email-el felhasználó');
    }
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.createUser({
      nev: dto.name,
      email: dto.email,
      jelszo_hash: hash,
    });
    const payload = {
      sub: user.felhasznalo_id,
      email: user.email,
      szerepkor: user.szerepkor,
    };
    return { access_token: await this.jwtService.signAsync(payload) };
  }

  async signIn(dto: SignInDto) {
    const user = await this.usersService.findOneByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    const ok = await bcrypt.compare(dto.password, user.jelszo_hash);
    if (!ok) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: user.felhasznalo_id,
      email: user.email,
      szerepkor: user.szerepkor,
    };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
