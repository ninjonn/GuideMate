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
    if (!record) {
      return undefined;
    }
    return this.mapToUser(record);
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const record = await this.prisma.felhasznalo.findUnique({
      where: { email },
    });
    if (!record) {
      return undefined;
    }
    return this.mapToUser(record);
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
