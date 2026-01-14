import { Module } from '@nestjs/common';
import { EllenorzoListaController } from './ellenorzo-lista.controller';
import { EllenorzoListaService } from './ellenorzo-lista.service';

@Module({
  controllers: [EllenorzoListaController],
  providers: [EllenorzoListaService],
  exports: [EllenorzoListaService],
})
export class EllenorzoListaModule {}
