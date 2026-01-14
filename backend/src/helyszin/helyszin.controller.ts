import { Controller } from '@nestjs/common';
import { HelyszinService } from './helyszin.service';

@Controller('helyszin')
export class HelyszinController {
  constructor(private readonly helyszinService: HelyszinService) {}
}
