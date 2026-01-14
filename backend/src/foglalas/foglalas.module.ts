import { Module } from '@nestjs/common';
import { FoglalasController } from './foglalas.controller';
import { FoglalasService } from './foglalas.service';

@Module({
  // Foglalas modul: controller + service, a foglalas vegpontokhoz.
  controllers: [FoglalasController],
  providers: [FoglalasService],
  exports: [FoglalasService],
})
export class FoglalasModule {}
