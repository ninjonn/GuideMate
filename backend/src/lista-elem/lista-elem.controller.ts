import { Controller } from '@nestjs/common';
import { ListaElemService } from './lista-elem.service';

@Controller('lista-elem')
export class ListaElemController {
  constructor(private readonly listaElemService: ListaElemService) {}
}
