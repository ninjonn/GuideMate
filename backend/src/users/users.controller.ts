import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Put,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

type AuthedRequest = Request & { user?: { sub: number; email: string } };

@Controller(['api/felhasznalok'])
// Profil es jelszo vegpontok bejelentkezett felhasznaloknak.
export class UsersController {
  private readonly saltRounds = 10;

  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('profil')
  // Sajat profil lekerese a token alapjan.
  async getProfile(@Req() req: AuthedRequest): Promise<{
    azonosito: number;
    nev: string;
    email: string;
    regisztracio_datum: string;
    szerepkor: string;
    utazasok_szama: number;
  }> {
    // Tokenbol kinyerjuk a felhasznalo azonositojat.
    const authed = req.user;
    if (!authed || !authed.sub) {
      throw new UnauthorizedException('Nincs felhasználó a tokenben.');
    }
    // A DB-ben ellenorizzuk, hogy letezik-e a user.
    const user = await this.usersService.findOneById(authed.sub);
    if (!user) {
      throw new UnauthorizedException('Felhasználó nem található.');
    }
    // Utazasok szamat kulon lekerjuk a kapcsolotablabol.
    const tripCount = await this.usersService.countTripsForUser(user.userId);
    // A valaszt az API formatumhoz igazitjuk.
    return {
      azonosito: user.userId,
      nev: user.username,
      email: user.email,
      regisztracio_datum: user.createdAt.toISOString(),
      szerepkor: user.role,
      utazasok_szama: tripCount,
    };
  }

  @UseGuards(AuthGuard)
  @Put('profil')
  // Profil modositas: nev es/vagy email, alap validacioval.
  async updateProfile(
    @Req() req: AuthedRequest,
    @Body() dto: UpdateProfileDto,
  ): Promise<{
    azonosito: number;
    nev: string;
    email: string;
    sikeres: boolean;
    uzenet: string;
  }> {
    // Tokenbol kinyerjuk a felhasznalo azonositojat.
    const authed = req.user;
    if (!authed || !authed.sub) {
      throw new UnauthorizedException('Nincs felhasználó a tokenben.');
    }

    // Legalabb egy mezot meg kell adni.
    if (!dto.email && !dto.vezeteknev && !dto.keresztnev) {
      throw new BadRequestException('Nincs megadott módosítandó adat.');
    }
    if (
      (dto.vezeteknev && !dto.keresztnev) ||
      (!dto.vezeteknev && dto.keresztnev)
    ) {
      // A ket nevreszt egyutt kerjuk be, kulonben hiba.
      throw new BadRequestException(
        'A vezetéknév és keresztnév együtt kötelező.',
      );
    }

    // A jelenlegi user adatai kellenek az ellenorzeshez.
    const currentUser = await this.usersService.findOneById(authed.sub);
    if (!currentUser) {
      throw new UnauthorizedException('Felhasználó nem található.');
    }

    // A vezeteknev + keresztnev egy teljes nev lesz.
    let username: string | undefined;
    if (dto.vezeteknev && dto.keresztnev) {
      username = `${dto.vezeteknev} ${dto.keresztnev}`.trim();
    }

    let nextEmail = dto.email;
    if (nextEmail && nextEmail !== currentUser.email) {
      // Email legyen egyedi, csak valtozas eseten.
      const existing = await this.usersService.findOneByEmail(nextEmail);
      if (existing && existing.userId !== currentUser.userId) {
        throw new BadRequestException('Ezzel az emaillel már regisztráltak.');
      }
    } else {
      nextEmail = undefined;
    }

    // Ha vegul nincs valos valtozas, visszadobjuk.
    if (!username && !nextEmail) {
      throw new BadRequestException('Nincs megadott módosítandó adat.');
    }

    // A frissitest a service vegzi.
    const updated = await this.usersService.updateProfile(currentUser.userId, {
      username,
      email: nextEmail,
    });

    // Egyszeru sikeres valaszt adunk vissza.
    return {
      azonosito: updated.userId,
      nev: updated.username,
      email: updated.email,
      sikeres: true,
      uzenet: 'Profil sikeresen módosítva',
    };
  }

  @UseGuards(AuthGuard)
  @Put('jelszo')
  // Jelszocsere: regi jelszo ellenorzes + uj hash mentes.
  async changePassword(
    @Req() req: AuthedRequest,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ sikeres: boolean; uzenet: string }> {
    // Tokenbol kinyerjuk a felhasznalo azonositojat.
    const authed = req.user;
    if (!authed || !authed.sub) {
      throw new UnauthorizedException('Nincs felhasználó a tokenben.');
    }

    // A user megkeresese a DB-ben.
    const user = await this.usersService.findOneById(authed.sub);
    if (!user) {
      throw new UnauthorizedException('Felhasználó nem található.');
    }

    // A regi jelszot hasonlitjuk a tarolt hash-hez.
    const passwordMatch = await bcrypt.compare(
      dto.regi_jelszo,
      user.passwordHash,
    );
    // Hibas regi jelszo eseten tiltjuk.
    if (!passwordMatch) {
      throw new UnauthorizedException('Hibás jelszó.');
    }
    if (dto.regi_jelszo === dto.uj_jelszo) {
      throw new BadRequestException('Az új jelszó nem lehet azonos a régivel.');
    }

    // Az uj jelszot hash-elve mentjuk.
    const passwordHash = await bcrypt.hash(dto.uj_jelszo, this.saltRounds);
    await this.usersService.updatePasswordHash(user.userId, passwordHash);

    // Sikeres valasz egyszeru uzenettel.
    return {
      sikeres: true,
      uzenet: 'Jelszó sikeresen módosítva',
    };
  }
}
