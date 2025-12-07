import { Controller } from '@nestjs/common';
import { UtazasService } from './utazas.service';

@Controller('utazas')
export class UtazasController {
  constructor(private readonly utazasService: UtazasService) {}
}
