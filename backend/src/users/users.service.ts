import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

export type User = any;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByEmail(email: string) {
    return this.prisma.felhasznalo.findUnique({ where: { email } });
  }

  createUser(params: {
    nev: string;
    email: string;
    jelszo_hash: string;
    szerepkor?: string;
  }) {
    const { nev, email, jelszo_hash, szerepkor = 'felhasznalo' } = params;
    return this.prisma.felhasznalo.create({
      data: { nev, email, jelszo_hash, szerepkor },
    });
  }
}
