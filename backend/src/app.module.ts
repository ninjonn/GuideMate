import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma.module';
import { UtazasModule } from './utazas/utazas.module';
import { FoglalasModule } from './foglalas/foglalas.module';
import { ProgramModule } from './program/program.module';
import { LatnivaloModule } from './latnivalo/latnivalo.module';
import { HelyszinModule } from './helyszin/helyszin.module';
import { EllenorzoListaModule } from './ellenorzo-lista/ellenorzo-lista.module';
import { ListaElemModule } from './lista-elem/lista-elem.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    UtazasModule,
    FoglalasModule,
    ProgramModule,
    LatnivaloModule,
    HelyszinModule,
    EllenorzoListaModule,
    ListaElemModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
