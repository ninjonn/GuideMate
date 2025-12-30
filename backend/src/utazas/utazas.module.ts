import { Module } from '@nestjs/common';
import { UtazasController } from './utazas.controller';
import { UtazasService } from './utazas.service';

@Module({
  // Utazas modul: controller + service, alap CRUD vegpontokhoz.
  controllers: [UtazasController],
  providers: [UtazasService],
  exports: [UtazasService],
})
export class UtazasModule {}
