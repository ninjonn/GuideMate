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
export class UsersController {
  private readonly saltRounds = 10;

  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('profil')
  async getProfile(@Req() req: AuthedRequest): Promise<{
    azonosito: number;
    nev: string;
    email: string;
    regisztracio_datum: string;
    szerepkor: string;
    utazasok_szama: number;
  }> {
    const authed = req.user;
    if (!authed || !authed.sub) {
      throw new UnauthorizedException('Nincs felhasználó a tokenben.');
    }
    const user = await this.usersService.findOneById(authed.sub);
    if (!user) {
      throw new UnauthorizedException('Felhasználó nem található.');
    }
    return {
      azonosito: user.userId,
      nev: user.username,
      email: user.email,
      regisztracio_datum: user.createdAt.toISOString(),
      szerepkor: user.role,
      utazasok_szama: 0,
    };
  }

  @UseGuards(AuthGuard)
  @Put('profil')
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
    const authed = req.user;
    if (!authed || !authed.sub) {
      throw new UnauthorizedException('Nincs felhasználó a tokenben.');
    }

    if (!dto.email && !dto.vezeteknev && !dto.keresztnev) {
      throw new BadRequestException('Nincs megadott módosítandó adat.');
    }
    if (
      (dto.vezeteknev && !dto.keresztnev) ||
      (!dto.vezeteknev && dto.keresztnev)
    ) {
      throw new BadRequestException(
        'A vezetéknév és keresztnév együtt kötelező.',
      );
    }

    const currentUser = await this.usersService.findOneById(authed.sub);
    if (!currentUser) {
      throw new UnauthorizedException('Felhasználó nem található.');
    }

    let username: string | undefined;
    if (dto.vezeteknev && dto.keresztnev) {
      username = `${dto.vezeteknev} ${dto.keresztnev}`.trim();
    }

    let nextEmail = dto.email;
    if (nextEmail && nextEmail !== currentUser.email) {
      const existing = await this.usersService.findOneByEmail(nextEmail);
      if (existing && existing.userId !== currentUser.userId) {
        throw new BadRequestException('Ezzel az emaillel már regisztráltak.');
      }
    } else {
      nextEmail = undefined;
    }

    if (!username && !nextEmail) {
      throw new BadRequestException('Nincs megadott módosítandó adat.');
    }

    const updated = await this.usersService.updateProfile(currentUser.userId, {
      username,
      email: nextEmail,
    });

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
  async changePassword(
    @Req() req: AuthedRequest,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ sikeres: boolean; uzenet: string }> {
    const authed = req.user;
    if (!authed || !authed.sub) {
      throw new UnauthorizedException('Nincs felhasználó a tokenben.');
    }

    const user = await this.usersService.findOneById(authed.sub);
    if (!user) {
      throw new UnauthorizedException('Felhasználó nem található.');
    }

    const passwordMatch = await bcrypt.compare(
      dto.regi_jelszo,
      user.passwordHash,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException('Hibás jelszó.');
    }
    if (dto.regi_jelszo === dto.uj_jelszo) {
      throw new BadRequestException('Az új jelszó nem lehet azonos a régivel.');
    }

    const passwordHash = await bcrypt.hash(dto.uj_jelszo, this.saltRounds);
    await this.usersService.updatePasswordHash(user.userId, passwordHash);

    return {
      sikeres: true,
      uzenet: 'Jelszó sikeresen módosítva',
    };
  }
}
