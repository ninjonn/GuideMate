import { Controller } from '@nestjs/common';
import { LatnivaloService } from './latnivalo.service';

@Controller('latnivalo')
export class LatnivaloController {
  constructor(private readonly latnivaloService: LatnivaloService) {}
}
