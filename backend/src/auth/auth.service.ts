import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // Bcrypt korok szama a jelszo hash-hez.
  private readonly saltRounds = 10;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Bejelentkezes: felhasznalo azonositas, jelszo hash ellenorzes, JWT generalas.
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
    // Email alapjan megkeressuk a felhasznalot.
    const baseUser = await this.usersService.findOneByEmail(email);
    if (!baseUser) {
      throw new UnauthorizedException();
    }
    // A tarolt hash es a megadott jelszo osszevetese.
    const passwordMatch = await bcrypt.compare(jelszo, baseUser.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException();
    }
    // A token payloadja minimalis azonosito adatokat tartalmaz.
    const payload = { sub: baseUser.userId, email: baseUser.email };
    const token = await this.jwtService.signAsync(payload);
    // A valaszban visszaadjuk a tokenen kivul az alap user adatokat is.
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

  // Regisztracio: email ellenorzes, nev osszerakas, jelszo hash keszitese, felhasznalo mentes.
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
    // Ellenorizzuk, hogy az email nem foglalt-e.
    const existing = await this.usersService.findOneByEmail(email);
    if (existing) {
      throw new BadRequestException('Ezzel az emaillel már regisztráltak.');
    }
    // A teljes nev a vezeteknev + keresztnev.
    const username = `${vezeteknev} ${keresztnev}`.trim();
    // A jelszot hash-elve taroljuk.
    const passwordHash = await bcrypt.hash(jelszo, this.saltRounds);
    // A felhasznalot a users service hozza letre.
    const user = await this.usersService.createUser({
      username,
      email,
      passwordHash,
    });
    // A valasz formatum az API dokumentaciohoz igazodik.
    return {
      azonosito: user.userId,
      nev: user.username,
      email: user.email,
      szerepkor: user.role,
      regisztracio_datum: user.createdAt.toISOString(),
    };
  }
}
