import {
  Controller,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import { UsersService } from './users.service';

@Controller(['api/felhasznalok'])
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('profil')
  async getProfile(
    @Req() req: Request & { user?: { sub: number; email: string } },
  ): Promise<{
    azonosito: number;
    nev: string;
    email: string;
    regisztracio_datum: string;
    szerepkor: string;
    utazasok_szama: number;
  }> {
    const authed = req.user;
    if (!authed || !authed.email) {
      throw new UnauthorizedException('Nincs felhasználó a tokenben.');
    }
    const user = await this.usersService.findOneByEmail(authed.email);
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
}
