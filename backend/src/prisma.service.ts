import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    // A DB URL kotelezo, kulonben leallunk indulasnal.
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('A DATABASE_URL kötelező a Prisma inicializálásához.');
    }

    // MariaDB adapterrel inicializaljuk a Prisma klienst.
    // Az adapter a pool kezeleset is biztositja.
    const adapter = new PrismaMariaDb(databaseUrl);
    super({ adapter });
  }

  async onModuleInit() {
    // App indulasakor csatlakozunk a DB-hez.
    // Ez segit, hogy a hiba hamar latszodjon.
    await this.$connect();
  }
  async onModuleDestroy() {
    // App leallaskor bontjuk a kapcsolatot, hogy ne maradjon nyitva.
    // A kapcsolatokat tisztan zarjuk le.
    await this.$disconnect();
  }
}
