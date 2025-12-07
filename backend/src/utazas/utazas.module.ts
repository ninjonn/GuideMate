import { Module } from '@nestjs/common';
import { UtazasController } from './utazas.controller';
import { UtazasService } from './utazas.service';

@Module({
  controllers: [UtazasController],
  providers: [UtazasService],
  exports: [UtazasService],
})
export class UtazasModule {}
