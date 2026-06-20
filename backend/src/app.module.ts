import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { UtazasModule } from './utazas/utazas.module';
import { FoglalasModule } from './foglalas/foglalas.module';
import { ProgramModule } from './program/program.module';
import { EllenorzoListaModule } from './ellenorzo-lista/ellenorzo-lista.module';
import { ListaElemModule } from './lista-elem/lista-elem.module';
import { PrismaModule } from './prisma.module';
import { ImagesModule } from './images/images.module';
import { GeoModule } from './geo/geo.module';

@Module({
  imports: [
    // Globalis config + DB + feature modulok, innen indul az app.
    ConfigModule.forRoot({ isGlobal: true }),
    // Alapertelmezett rate limit: 120 keres / perc / IP (vedelem a visszaeles ellen).
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    PrismaModule,
    // Auth es users modulok a bejelentkezeshez es profilhoz.
    AuthModule,
    UsersModule,
    AdminModule,
    // Domain modulok a tobbi endpoint logikajahoz.
    UtazasModule,
    FoglalasModule,
    ProgramModule,
    EllenorzoListaModule,
    ListaElemModule,
    ImagesModule,
    GeoModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Globalis rate limit guard minden vegpontra (a @Public utvonalakra is).
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
