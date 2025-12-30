import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

export interface User {
  userId: number;
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

// A Prisma rekord formaja, amit belso user tipusra alakitunk.
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

  // Felhasznalo lekeres ID alapjan, hiany eseten undefined.
  async findOneById(userId: number): Promise<User | undefined> {
    // Egyetlen rekordot keresunk primer kulcs alapjan.
    const record = await this.prisma.felhasznalo.findUnique({
      where: { felhasznalo_id: userId },
    });
    if (!record) {
      return undefined;
    }
    // A Prisma rekordot app formatumra alakitjuk.
    return this.mapToUser(record);
  }

  // Felhasznalo lekeres email alapjan, loginhoz es ellenorzeshez.
  async findOneByEmail(email: string): Promise<User | undefined> {
    // Egyedi emailre keresunk, ez a login alapja.
    const record = await this.prisma.felhasznalo.findUnique({
      where: { email },
    });
    if (!record) {
      return undefined;
    }
    // A Prisma rekordot app formatumra alakitjuk.
    return this.mapToUser(record);
  }

  // Uj felhasznalo mentese, alap szerepkor: felhasznalo.
  async createUser(data: {
    username: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    // A DB-ben a nev es a hash mezok is kotottek.
    const created = await this.prisma.felhasznalo.create({
      data: {
        nev: data.username,
        email: data.email,
        jelszo_hash: data.passwordHash,
        szerepkor: 'felhasznalo',
      },
    });
    // Letrehozas utan visszaadjuk az egyseges user formatumot.
    return this.mapToUser(created);
  }

  // Profil adatok frissitese (nev/email).
  async updateProfile(
    userId: number,
    data: { username?: string; email?: string },
  ): Promise<User> {
    // Csak a megadott mezoket irjuk felul.
    const updated = await this.prisma.felhasznalo.update({
      where: { felhasznalo_id: userId },
      data: {
        nev: data.username,
        email: data.email,
      },
    });
    // Frissitett adatokat app formatumban adjuk vissza.
    return this.mapToUser(updated);
  }

  // Jelszo hash frissitese, csak a hash mezot irjuk.
  async updatePasswordHash(
    userId: number,
    passwordHash: string,
  ): Promise<void> {
    // Kulon update, hogy ne nyuljunk mas mezokhoz.
    await this.prisma.felhasznalo.update({
      where: { felhasznalo_id: userId },
      data: { jelszo_hash: passwordHash },
    });
  }

  // Utazasok szama a felhasznalohoz (resztvevo rekordok szama).
  async countTripsForUser(userId: number): Promise<number> {
    // A resztvevo tabla darabszama adja a trip count-ot.
    return await this.prisma.utazasResztvevo.count({
      where: { felhasznalo_id: userId },
    });
  }

  // Prisma rekord -> app user forma, egyseges visszaadas.
  private mapToUser(record: FelhasznaloRecord): User {
    // Itt nevezzuk at a mezoket az appban hasznalt formara.
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
