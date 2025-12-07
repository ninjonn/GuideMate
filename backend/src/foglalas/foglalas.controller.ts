import { Controller } from '@nestjs/common';
import { FoglalasService } from './foglalas.service';

@Controller('foglalas')
export class FoglalasController {
  constructor(private readonly foglalasService: FoglalasService) {}
}
