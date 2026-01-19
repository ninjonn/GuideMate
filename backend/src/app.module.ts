import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { UtazasModule } from './utazas/utazas.module';
import { FoglalasModule } from './foglalas/foglalas.module';
import { ProgramModule } from './program/program.module';
import { LatnivaloModule } from './latnivalo/latnivalo.module';
import { HelyszinModule } from './helyszin/helyszin.module';
import { EllenorzoListaModule } from './ellenorzo-lista/ellenorzo-lista.module';
import { ListaElemModule } from './lista-elem/lista-elem.module';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [
    // Globalis config + DB + feature modulok, innen indul az app.
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    // Auth es users modulok a bejelentkezeshez es profilhoz.
    AuthModule,
    UsersModule,
    AdminModule,
    // Domain modulok a tobbi endpoint logikajahoz.
    UtazasModule,
    FoglalasModule,
    ProgramModule,
    LatnivaloModule,
    HelyszinModule,
    EllenorzoListaModule,
    ListaElemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
