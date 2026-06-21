import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Proxy mogott (Render/Railway/stb.) a valos kliens IP-t az X-Forwarded-For adja.
  // Enelkul a rate limiter mindenkit egy IP-nek lat es egyutt korlatozna oket.
  app.set('trust proxy', 1);

  // CORS: ha a CORS_ORIGIN env be van allitva (vesszovel elvalasztott lista),
  // csak azokat a domaineket engedjuk. Ha nincs (pl. lokalis fejlesztes),
  // minden originbol jovo kerest elfogadunk.
  const corsOrigins = process.env.CORS_ORIGIN?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins && corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
