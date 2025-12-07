import { Module } from '@nestjs/common';
import { ListaElemController } from './lista-elem.controller';
import { ListaElemService } from './lista-elem.service';

@Module({
  controllers: [ListaElemController],
  providers: [ListaElemService],
  exports: [ListaElemService],
})
export class ListaElemModule {}
