import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

export const SALT_ROUNDS = 10;

export interface User {
  userId: number;
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

type FelhasznaloRecord = {
  felhasznalo_id: number;
  nev: string;
  email: string;
  jelszo_hash: string;
  szerepkor: string;
  letrehozva: Date;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneById(userId: number): Promise<User | undefined> {
    const record = await this.prisma.felhasznalo.findUnique({
      where: { felhasznalo_id: userId },
    });
    return record ? this.mapToUser(record) : undefined;
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const record = await this.prisma.felhasznalo.findUnique({
      where: { email },
    });
    return record ? this.mapToUser(record) : undefined;
  }

  async createUser(data: {
    username: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    const created = await this.prisma.felhasznalo.create({
      data: {
        nev: data.username,
        email: data.email,
        jelszo_hash: data.passwordHash,
        szerepkor: 'felhasznalo',
      },
    });
    return this.mapToUser(created);
  }

  async countTripsForUser(userId: number): Promise<number> {
    return this.prisma.utazasResztvevo.count({
      where: { felhasznalo_id: userId },
    });
  }

  async getProfile(userId: number): Promise<{
    azonosito: number;
    nev: string;
    email: string;
    regisztracio_datum: string;
    szerepkor: string;
    utazasok_szama: number;
  }> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new UnauthorizedException('Felhasználó nem található.');
    }
    const tripCount = await this.countTripsForUser(user.userId);
    return {
      azonosito: user.userId,
      nev: user.username,
      email: user.email,
      regisztracio_datum: user.createdAt.toISOString(),
      szerepkor: user.role,
      utazasok_szama: tripCount,
    };
  }

  async updateProfileFromDto(
    userId: number,
    dto: UpdateProfileDto,
  ): Promise<{
    azonosito: number;
    nev: string;
    email: string;
    sikeres: boolean;
    uzenet: string;
  }> {
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

    const currentUser = await this.findOneById(userId);
    if (!currentUser) {
      throw new UnauthorizedException('Felhasználó nem található.');
    }

    let username: string | undefined;
    if (dto.vezeteknev && dto.keresztnev) {
      username = `${dto.vezeteknev} ${dto.keresztnev}`.trim();
    }

    let nextEmail = dto.email;
    if (nextEmail && nextEmail !== currentUser.email) {
      const existing = await this.findOneByEmail(nextEmail);
      if (existing && existing.userId !== currentUser.userId) {
        throw new BadRequestException('Ezzel az emaillel már regisztráltak.');
      }
    } else {
      nextEmail = undefined;
    }

    if (!username && !nextEmail) {
      throw new BadRequestException('Nincs megadott módosítandó adat.');
    }

    const updated = await this.updateProfile(currentUser.userId, {
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

  async changePassword(
    userId: number,
    dto: ChangePasswordDto,
  ): Promise<{ sikeres: boolean; uzenet: string }> {
    const user = await this.findOneById(userId);
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

    const passwordHash = await bcrypt.hash(dto.uj_jelszo, SALT_ROUNDS);
    await this.updatePasswordHash(user.userId, passwordHash);

    return { sikeres: true, uzenet: 'Jelszó sikeresen módosítva' };
  }

  async updateProfile(
    userId: number,
    data: { username?: string; email?: string },
  ): Promise<User> {
    const updated = await this.prisma.felhasznalo.update({
      where: { felhasznalo_id: userId },
      data: {
        nev: data.username,
        email: data.email,
      },
    });
    return this.mapToUser(updated);
  }

  async updatePasswordHash(
    userId: number,
    passwordHash: string,
  ): Promise<void> {
    await this.prisma.felhasznalo.update({
      where: { felhasznalo_id: userId },
      data: { jelszo_hash: passwordHash },
    });
  }

  private mapToUser(record: FelhasznaloRecord): User {
    return {
      userId: record.felhasznalo_id,
      username: record.nev,
      email: record.email,
      passwordHash: record.jelszo_hash,
      role: record.szerepkor,
      createdAt: record.letrehozva,
    };
  }
}
