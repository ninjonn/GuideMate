import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    // Bearer tokenbol olvas, lejart token eseten hibazik, secret a JWT_SECRET.
    // Itt ellenorizzuk, hogy van-e secret a konfiguracioban.
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('A JWT_SECRET kotelezo a JWT strategiahoz.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  // A payload kerul a req.user mezobe, a controllerek ezt hasznaljak.
  validate(payload: { sub: number; email: string }) {
    // Nem nezunk DB-t, a token tartalma megy tovabb.
    return payload;
  }
}
