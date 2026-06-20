import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Proxy mogott (Render/Railway/stb.) a valos kliens IP-t az X-Forwarded-For adja.
  // Enelkul a rate limiter mindenkit egy IP-nek lat es egyutt korlatozna oket.
  app.set('trust proxy', 1);

  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
