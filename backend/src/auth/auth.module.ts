import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { UsersModule } from 'src/users/users.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    // Users modul kell a regisztraciohoz es bejelentkezeshez.
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // JWT beallitasok kornyezeti valtozobol, 1 oras lejarattal.
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  // Globalis guard + JWT strategia.
  providers: [
    AuthService,
    JwtStrategy,
    // Minden vegpontra automatikusan kerul a guard, kiveve a @Public-ot.
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  // A service exportalva, hogy mas modulok is hivhassak.
  exports: [AuthService],
})
export class AuthModule {}
