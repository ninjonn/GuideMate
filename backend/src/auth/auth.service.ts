import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService, SALT_ROUNDS } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signInHu(
    email: string,
    jelszo: string,
  ): Promise<{
    token: string;
    felhasznalo: {
      azonosito: number;
      nev: string;
      email: string;
      szerepkor: string;
    };
  }> {
    const baseUser = await this.usersService.findOneByEmail(email);
    if (!baseUser) {
      throw new UnauthorizedException();
    }
    const passwordMatch = await bcrypt.compare(jelszo, baseUser.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException();
    }
    const payload = { sub: baseUser.userId, email: baseUser.email };
    const token = await this.jwtService.signAsync(payload);
    return {
      token,
      felhasznalo: {
        azonosito: baseUser.userId,
        nev: baseUser.username,
        email: baseUser.email,
        szerepkor: baseUser.role,
      },
    };
  }

  async signUpHu(
    vezeteknev: string,
    keresztnev: string,
    email: string,
    jelszo: string,
  ): Promise<{
    azonosito: number;
    nev: string;
    email: string;
    szerepkor: string;
    regisztracio_datum: string;
  }> {
    const existing = await this.usersService.findOneByEmail(email);
    if (existing) {
      throw new BadRequestException('Ezzel az emaillel már regisztráltak.');
    }
    const username = `${vezeteknev} ${keresztnev}`.trim();
    const passwordHash = await bcrypt.hash(jelszo, SALT_ROUNDS);
    const user = await this.usersService.createUser({
      username,
      email,
      passwordHash,
    });
    return {
      azonosito: user.userId,
      nev: user.username,
      email: user.email,
      szerepkor: user.role,
      regisztracio_datum: user.createdAt.toISOString(),
    };
  }
}
