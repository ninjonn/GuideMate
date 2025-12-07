import { Module } from '@nestjs/common';
import { FoglalasController } from './foglalas.controller';
import { FoglalasService } from './foglalas.service';

@Module({
  controllers: [FoglalasController],
  providers: [FoglalasService],
  exports: [FoglalasService],
})
export class FoglalasModule {}
