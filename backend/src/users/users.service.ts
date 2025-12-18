import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Felhasznalo } from '@prisma/client';

export interface User {
  userId: number;
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByEmail(email: string): Promise<User | undefined> {
    const record = await this.prisma.felhasznalo.findUnique({ where: { email } });
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

  private mapToUser(record: Felhasznalo): User {
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
