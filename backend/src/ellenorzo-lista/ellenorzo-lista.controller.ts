import { Controller } from '@nestjs/common';
import { EllenorzoListaService } from './ellenorzo-lista.service';

@Controller('ellenorzo-lista')
export class EllenorzoListaController {
  constructor(private readonly ellenorzoListaService: EllenorzoListaService) {}
}
